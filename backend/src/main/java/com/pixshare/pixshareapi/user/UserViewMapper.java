package com.pixshare.pixshareapi.user;

import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class UserViewMapper implements Function<User, UserView> {
    @Override
    public UserView apply(User user) {
        return new UserView(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getName(),
                user.getUserImage()
        );
    }

}
