package com.pixshare.pixshareapi.user;

import com.pixshare.pixshareapi.comment.Comment;
import com.pixshare.pixshareapi.post.Post;
import com.pixshare.pixshareapi.story.Story;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String name;
    private String mobile;
    private String website;
    private String bio;
    private Gender gender;
    private String userImage;
    private Set<UserDTO> follower;
    private Set<UserDTO> following;
    private List<Story> stories;
    private Set<Post> savedPosts;
    private List<Post> posts;
    private List<Comment> comments;
}
