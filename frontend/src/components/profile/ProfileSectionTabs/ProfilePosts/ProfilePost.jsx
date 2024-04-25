import {
  Badge,
  Flex,
  HStack,
  IconButton,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { BiExpandAlt } from "react-icons/bi";
import { FaComment, FaHeart } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { setActivePostIdAction } from "../../../../redux/actions/post/postInteractionActions";
import { findPostByIdAction } from "../../../../redux/actions/post/postLookupActions";
import { clearCommentManagement } from "../../../../redux/reducers/comment/commentManagementSlice";
import { clearPostById } from "../../../../redux/reducers/post/postLookupSlice";
import { getHumanReadableNumberFormat } from "../../../../utils/commonUtils";
import PostViewModal from "../../../post/PostFeed/PostFeedCard/PostViewModal/PostViewModal";
import ImageWithLoader from "../../../shared/ImageWithLoader";

const ProfilePost = ({ currUser, post, updateLoadedPostEntry }) => {
  const breakpoint = useBreakpointValue({ base: "base", sm: "sm", md: "md" });
  const isSmallScreen = breakpoint === "base" || breakpoint === "sm";
  const {
    isOpen: isOpenPostViewModal,
    onOpen: onOpenPostViewModal,
    onClose: onClosePostViewModal,
  } = useDisclosure();

  const dispatch = useDispatch();
  const postInteraction = useSelector((store) => store.post.postInteraction);
  const { findPostById } = useSelector((store) => store.post.postLookup);
  const commentManagement = useSelector(
    (store) => store.comment.commentManagement
  );
  const token = localStorage.getItem("token");

  const [showOverlay, setShowOverlay] = useState(false);
  const isActivePost = postInteraction.activePostId === post?.id || showOverlay;
  const [isSavedByUser, setIsSavedByUser] = useState(
    post && !_.isEmpty(post) ? post?.isSavedByAuthUser : false
  );

  const likedByUsersLength = post?.likedByUsers?.length || 0;
  const likedByUsersCount = getHumanReadableNumberFormat(likedByUsersLength);
  const commentsLength = post?.comments?.length || 0;
  const commentsCount = getHumanReadableNumberFormat(commentsLength);

  const handleShowPostOverlay = () => {
    if (post?.id) {
      dispatch(setActivePostIdAction(post?.id));
    }
  };

  const handleHidePostOverlay = () => {
    dispatch(setActivePostIdAction(null));
  };

  const togglePostOverlay = () => {
    setShowOverlay((prev) => !prev);
  };

  const handleOpenPostViewModal = () => {
    onOpenPostViewModal();
  };

  useEffect(() => {
    if (
      token &&
      post?.id &&
      commentManagement.isCommentCreated &&
      commentManagement.updatedPostId === post?.id
    ) {
      const data = {
        token,
        postId: post?.id,
      };

      dispatch(clearCommentManagement());
      dispatch(findPostByIdAction(data));
    }
  }, [
    commentManagement.isCommentCreated,
    commentManagement.updatedPostId,
    dispatch,
    post?.id,
    token,
  ]);

  useEffect(() => {
    if (
      token &&
      post?.id &&
      commentManagement.isCommentDeleted &&
      commentManagement.updatedPostId === post?.id
    ) {
      const data = {
        token,
        postId: post?.id,
      };

      dispatch(clearCommentManagement());
      dispatch(findPostByIdAction(data));
    }
  }, [
    commentManagement.isCommentDeleted,
    commentManagement.updatedPostId,
    dispatch,
    post?.id,
    token,
  ]);

  useEffect(() => {
    const postById = findPostById;

    if (postById && postById?.id === post?.id) {
      dispatch(clearPostById(post?.id));
      updateLoadedPostEntry(postById?.id, postById);
    }
  }, [dispatch, findPostById, post?.id, updateLoadedPostEntry]);

  return (
    <Flex
      position="relative"
      align="center"
      justify="center"
      rounded="lg"
      w="full"
      boxShadow="md"
      overflow="hidden"
      pointerEvents="none"
    >
      <PostViewModal
        currUser={currUser}
        post={{ ...post, isSavedByUser }}
        updateLoadedPostEntry={updateLoadedPostEntry}
        isOpen={isOpenPostViewModal}
        onClose={onClosePostViewModal}
      />

      <Flex
        flex={1}
        h="full"
        align="center"
        textAlign="center"
        pointerEvents="auto"
        onMouseEnter={isSmallScreen ? null : togglePostOverlay}
        onClick={handleShowPostOverlay}
        minH={{ base: "125px", md: "175px" }}
        maxH={"200px"}
        aspectRatio={1 / 1}
      >
        <ImageWithLoader
          skeletonProps={{ h: "full" }}
          src={post?.image}
          alt="Post Image"
          objectFit="cover"
          rounded="lg"
          w="full"
          h="full"
        />
      </Flex>

      {isActivePost && (
        <Flex
          pointerEvents="auto"
          onMouseLeave={isSmallScreen ? null : togglePostOverlay}
          onClick={handleHidePostOverlay}
          className="overlay"
          align="center"
          justify="center"
          color="white"
          position="absolute"
          inset="0"
          zIndex="10"
          bgGradient="linear(to-t, blackAlpha.700, blackAlpha.300)"
          rounded="lg"
          w="full"
          h="full"
        >
          <Flex
            flexDirection="column"
            position="relative"
            justify="center"
            flex="1"
            h="full"
            gap={0}
            rounded="lg"
          >
            <HStack spacing={2} justify="center" flexWrap="wrap" rounded="lg">
              <Flex mx={1} my={2} align={"center"} rounded="full">
                <IconButton
                  icon={<FaHeart />}
                  rounded="full"
                  ml={-3}
                  colorScheme="white"
                  fontSize={{ base: "lg", md: "20px" }}
                  variant="link"
                  aria-label="Like"
                  pointerEvents="none"
                  cursor="default"
                />
                <Badge
                  variant={"solid"}
                  ml="-1"
                  px={2.5}
                  bgGradient={"linear(to-tr, yellow.400, pink.500)"}
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="semibold"
                  fontFamily="sans-serif"
                  rounded="full"
                >
                  {likedByUsersCount}
                </Badge>
              </Flex>

              <Flex mx={1} my={2} align={"center"} rounded="full">
                <IconButton
                  icon={<FaComment />}
                  rounded="full"
                  ml={-3}
                  colorScheme="white"
                  fontSize={{ base: "lg", md: "20px" }}
                  variant="link"
                  aria-label="Comment"
                  pointerEvents="none"
                  cursor="default"
                />
                <Badge
                  variant={"solid"}
                  ml="-1"
                  px={2.5}
                  bgGradient={"linear(to-tr, yellow.400, pink.500)"}
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="semibold"
                  fontFamily="sans-serif"
                  rounded="full"
                >
                  {commentsCount}
                </Badge>
              </Flex>
            </HStack>

            <HStack
              position="absolute"
              top="0"
              p={{ base: "1", md: "1.5" }}
              w="full"
              justify="end"
              rounded="lg"
            >
              <IconButton
                icon={<BiExpandAlt />}
                bg="gray.100"
                rounded="full"
                colorScheme="gray"
                size={isSmallScreen ? "sm" : "md"}
                fontSize={{ base: "md", md: "lg" }}
                variant="solid"
                boxShadow={"md"}
                _hover={{
                  bg: "gray.200",
                }}
                _dark={{ bg: "gray.400", _hover: { bg: "gray.500" } }}
                onClick={handleOpenPostViewModal}
              />
            </HStack>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default ProfilePost;
