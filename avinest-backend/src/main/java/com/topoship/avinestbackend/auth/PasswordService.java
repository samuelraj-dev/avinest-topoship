package com.topoship.avinestbackend.auth;

import de.mkammerer.argon2.Argon2;
import de.mkammerer.argon2.Argon2Factory;

public class PasswordService {
    private static final Argon2 ARGON2 = Argon2Factory.create(Argon2Factory.Argon2Types.ARGON2id);

    public static String hash(char[] password) {
        return ARGON2.hash(
                3,
                65536,
                2,
                password
        );
    }

    public static boolean verify(String hash, char[] password) {
        return ARGON2.verify(hash, password);
    }
}
