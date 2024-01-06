import { Flex } from "@chakra-ui/react";
import { Map, OrderedMap, Set } from "immutable";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { Virtuoso } from "react-virtuoso";
import {
  POSTS_DEFAULT_PAGE,
  POSTS_PER_PAGE,
} from "../../../utils/constants/pagination/postPagination";
import EmptyPostFeed from "../EmptyPostFeed";
import EndOfPostFeed from "./EndOfPostFeed";
import PostFeedCard from "./PostFeedCard/PostFeedCard";
import PostFeedCardSkeleton from "./PostFeedCard/PostFeedCardSkeleton";

const PostFeed = ({
  currUser,
  posts,
  handlePageChange,
  checkPostLikedByCurrUser,
  checkPostSavedByCurrUser,
  removeCachedPostLikedPage,
  removeCachedPostSavedPage,
}) => {
  const [latestLoadedPage, setLatestLoadedPage] = useState(POSTS_DEFAULT_PAGE);
  const [loadedPostsPage, setLoadedPostsPage] = useState(posts);
  const [pageIndexMap, setPageIndexMap] = useState(Map());
  const [postIdToPageMap, setPostIdToPageMap] = useState(Map());
  const [loadedPostsMap, setLoadedPostsMap] = useState(OrderedMap());

  const { popularUsers } = useSelector((store) => store.user.userLookup);
  const { isPostCreated, isPostDeleted, deletedPostId } = useSelector(
    (store) => store.post.postManagement
  );
  const { isLoading: isLoadingPostLookup } = useSelector(
    (store) => store.post.postLookup
  );
  const virtuosoRef = useRef(null);

  const loadMorePosts = () => {
    if (loadedPostsPage.last) return;

    handlePageChange(latestLoadedPage + 1);

    // Increment the latestLoadedPage state variable
    latestLoadedPage < loadedPostsPage.totalPages
      ? setLatestLoadedPage((prevPage) => prevPage + 1)
      : setLatestLoadedPage(loadedPostsPage.page + 1);
  };

  const handleRefreshFeed = () => {
    // Scroll to the last item in the list
    const itemCount = loadedPostsMap.size;
    virtuosoRef.current?.scrollToIndex({
      index: itemCount - 1,
    });

    // Reload the page
    window.location.reload();
  };

  const populateInitialPostsPage = useCallback((initialPostsPage) => {
    if (initialPostsPage?.content) {
      const initialPosts = initialPostsPage?.content;
      const postIds = initialPosts.map((post) => post.id);
      console.log("Initial Posts:", initialPosts);

      const newPageIndexMap = Map().set(initialPostsPage?.page, postIds);
      setPageIndexMap(newPageIndexMap);

      const newPostIdToPageMap = Map(
        initialPosts.map((post) => [post.id, initialPostsPage?.page])
      );
      setPostIdToPageMap(newPostIdToPageMap);

      const newLoadedPostsMap = OrderedMap(
        initialPosts.map((post) => [post.id, post])
      );
      setLoadedPostsMap(newLoadedPostsMap);
    }
  }, []);

  const addNewPostsPageData = useCallback((newPostsPage) => {
    if (
      newPostsPage?.content &&
      newPostsPage?.page < newPostsPage?.totalPages
    ) {
      const newPosts = newPostsPage?.content;
      const postIds = newPosts.map((post) => post.id);
      console.log("New Posts:", newPosts);

      const newPageIndexMap = Map().set(newPostsPage?.page, postIds);
      setPageIndexMap((prevMap) => prevMap.merge(newPageIndexMap));

      const newPostIdToPageMap = Map(
        newPosts.map((post) => [post.id, newPostsPage?.page])
      );
      setPostIdToPageMap((prevMap) => prevMap.merge(newPostIdToPageMap));

      const newLoadedPostsMap = OrderedMap(
        newPosts.map((post) => [post.id, post])
      );
      setLoadedPostsMap((prevPosts) => prevPosts.merge(newLoadedPostsMap));
    }
  }, []);

  const clearDeletedPostData = useCallback(
    (deletedPostId, deletedPostPageNum) => {
      setPageIndexMap((prevMap) =>
        prevMap.filter((_, pageNum) => pageNum !== deletedPostPageNum)
      );

      setPostIdToPageMap((prevMap) =>
        prevMap.filter((_, postId) => postId !== deletedPostId)
      );

      setLoadedPostsMap((prevPostsMap) =>
        prevPostsMap.filter((_, postId) => postId !== deletedPostId)
      );
    },
    []
  );

  const clearPagesOnPostDelete = useCallback(
    (pagesToRemove = []) => {
      let postIdsToRemove = Set();
      const postIdsToRemoveBatches = [];

      pagesToRemove.forEach((_, pageNum) => {
        const pagePostIds = pageIndexMap.get(pageNum);
        const postIdsToRemoveBatch = Set(pagePostIds);

        postIdsToRemove = postIdsToRemove.union(pagePostIds);

        postIdsToRemoveBatches.push(postIdsToRemoveBatch);
      });

      console.log("pagesToRemove: ", pagesToRemove);

      setPageIndexMap((prevMap) =>
        prevMap.filter((_, pageNum) => !pagesToRemove.has(pageNum))
      );

      setPostIdToPageMap((prevMap) =>
        prevMap.filter((_, postId) => !postIdsToRemove.has(postId))
      );

      setLoadedPostsMap((prevPostsMap) =>
        postIdsToRemoveBatches.reduce(
          (map, batch) => map.filter((_, postId) => !batch.has(postId)),
          prevPostsMap
        )
      );
    },
    [pageIndexMap]
  );

  const refetchPostPage = useCallback(
    (pageNumber) => {
      handlePageChange(pageNumber);

      setLatestLoadedPage(pageNumber);
    },
    [handlePageChange]
  );

  const clearCachedPage = useCallback(
    (pageNumber) => {
      removeCachedPostLikedPage(pageNumber);
      removeCachedPostSavedPage(pageNumber);
    },
    [removeCachedPostLikedPage, removeCachedPostSavedPage]
  );

  useEffect(() => {
    if (posts) {
      const loadedPostsPage = posts;
      setLoadedPostsPage(posts);

      if (loadedPostsPage?.page === POSTS_DEFAULT_PAGE - 1) {
        populateInitialPostsPage(loadedPostsPage);
      } else {
        addNewPostsPageData(loadedPostsPage);
      }
    }
  }, [addNewPostsPageData, populateInitialPostsPage, posts]);

  useEffect(() => {
    if (isPostCreated) {
      // Refetch first page
      refetchPostPage(POSTS_DEFAULT_PAGE);

      clearCachedPage(POSTS_DEFAULT_PAGE - 1);
    }
  }, [clearCachedPage, isPostCreated, refetchPostPage]);

  useEffect(() => {
    if (isPostDeleted && deletedPostId) {
      const deletedPostPageNum = postIdToPageMap.get(deletedPostId);

      clearDeletedPostData(deletedPostId, deletedPostPageNum);

      const pagesToRemove =
        deletedPostPageNum === POSTS_DEFAULT_PAGE - 1
          ? Map()
          : pageIndexMap.filter((_, pageNum) => pageNum > deletedPostPageNum);

      clearPagesOnPostDelete(pagesToRemove);

      // Only refetch deleted page
      refetchPostPage(deletedPostPageNum + 1);

      clearCachedPage(deletedPostPageNum);
    }
  }, [
    clearCachedPage,
    clearDeletedPostData,
    clearPagesOnPostDelete,
    deletedPostId,
    isPostDeleted,
    pageIndexMap,
    postIdToPageMap,
    refetchPostPage,
  ]);

  console.log(
    "latestLoadedPage and totalPages and lastPage and loadedPostsPage and loadedPosts: ",
    latestLoadedPage,
    loadedPostsPage.totalPages,
    loadedPostsPage.last,
    loadedPostsPage,
    loadedPostsMap,
    pageIndexMap,
    postIdToPageMap
  );

  const PostFeedCardItem = ({ post, postIdPage }) => {
    const MemoizedPostFeedCard = useMemo(
      () => (
        <Flex key={post?.id} justifyContent="center">
          <PostFeedCard
            currUser={currUser}
            post={post}
            postIdPage={postIdPage}
            checkPostLikedByCurrUser={checkPostLikedByCurrUser}
            checkPostSavedByCurrUser={checkPostSavedByCurrUser}
          />
        </Flex>
      ),
      [post, postIdPage]
    );

    return MemoizedPostFeedCard;
  };

  const rowContent = (index) => {
    const post = loadedPostsMap.valueSeq().get(index);
    const postIdPage = postIdToPageMap.get(post?.id);

    return <PostFeedCardItem post={post} postIdPage={postIdPage} />;
  };

  const ScrollSeekPlaceholder = ({ height, width, index }) => (
    <PostFeedCardSkeleton height={height} width={width} index={index} />
  );

  const Footer = () => {
    if (isLoadingPostLookup) {
      // Adjust the number of loading placeholders based on the page size
      const loadingPlaceholderCount = Math.ceil(POSTS_PER_PAGE / 5);

      // Generate the loading placeholders
      const loadingPlaceholders = Array.from(
        { length: loadingPlaceholderCount },
        (_, index) => <PostFeedCardSkeleton key={index} index={index} />
      );

      return <>{loadingPlaceholders}</>;
    }

    if (loadedPostsPage.totalPages === 0) {
      return <EmptyPostFeed suggestedUsers={popularUsers} />;
    }

    if (loadedPostsPage.totalPages > 0 && loadedPostsPage.last) {
      return <EndOfPostFeed handleRefreshFeed={handleRefreshFeed} />;
    }

    return null;
  };

  return (
    <Flex flexDirection={"column"}>
      <div
        style={{
          height: "100vh",
          scrollBehavior: "smooth",
          // willChange: "transform",
        }}
      >
        <Virtuoso
          ref={virtuosoRef}
          style={{
            height: "100%",
          }}
          totalCount={loadedPostsMap.size}
          endReached={loadMorePosts}
          itemContent={rowContent}
          components={{ ScrollSeekPlaceholder, Footer }}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 1250,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
        />
      </div>
    </Flex>
  );
};

export default PostFeed;
