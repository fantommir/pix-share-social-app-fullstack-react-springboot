package com.pixshare.pixshareapi.dto;

import com.pixshare.pixshareapi.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UserDTOMapper implements Function<User, UserDTO> {

    private final PostDTOMapper postDTOMapper;

    public UserDTOMapper(PostDTOMapper postDTOMapper) {
        this.postDTOMapper = postDTOMapper;
    }

    @Override
    public UserDTO apply(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getName(),
                user.getMobile(),
                user.getWebsite(),
                user.getBio(),
                user.getGender(),
                user.getUserImage(),
                user.getFollower(),
                user.getFollowing(),
                new ArrayList<>(),
                user.getSavedPosts().stream()
                        .map(postDTOMapper)
                        .collect(Collectors.toCollection(
                                LinkedHashSet::new)),
                user.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList())
        );
    }

}
