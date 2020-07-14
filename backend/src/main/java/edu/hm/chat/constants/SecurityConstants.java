package edu.hm.chat.constants;

public final class SecurityConstants {

    public static final String AUTH_LOGIN_URL = "/api/authenticate";
    public static final String BASE_API_PATH = "api";

    public static final String DEFAULT_USERNAME = "admin@localhost";
    public static final String DEFAULT_PASSWORD = "admin";

    // Signing key for HS512 algorithm
    //TODO: IN properties auslagern
    public static final String JWT_SECRET = "i2r5u8xfA%D*M-KaPdSgVkYp3s6k9y$B&9(H+MbQeThWmZq4t7w!z%C*F-J@NcRf";

    // JWT token defaults
    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String TOKEN_TYPE = "JWT";
    public static final String TOKEN_ISSUER = "secure-api";
    public static final String TOKEN_AUDIENCE = "secure-app";

    private SecurityConstants() {
        throw new IllegalStateException("Cannot create instance of static util class");
    }
}
