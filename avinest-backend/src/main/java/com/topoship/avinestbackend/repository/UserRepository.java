package com.topoship.avinestbackend.repository;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import com.topoship.jooq.generated.tables.records.AppUsersRecord;

import java.util.Optional;

import static com.topoship.jooq.generated.tables.AppUsers.APP_USERS;

@Repository
public class UserRepository {

    private final DSLContext dsl;

    public UserRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<AppUsersRecord> findByUsername(String username) {
        return Optional.ofNullable(
                dsl.selectFrom(APP_USERS)
                        .where(APP_USERS.USERNAME.eq(username))
                        .fetchOne()
        );
    }

    public AppUsersRecord createOne(
            String username,
            String email,
            String phone,
            String fullName,
            String passwordHash,
            String role,
            String avatarUrl
    ) {
        return dsl.insertInto(APP_USERS)
                .set(APP_USERS.USERNAME, username)
                .set(APP_USERS.EMAIL, email)
                .set(APP_USERS.PHONE, phone)
                .set(APP_USERS.FULL_NAME, fullName)
                .set(APP_USERS.PASSWORD_HASH, passwordHash)
                .set(APP_USERS.ROLE, role)
                .set(APP_USERS.AVATAR_URL, avatarUrl)
                .returning()
                .fetchOne();
    }

    public void updatePassword(String username, String passwordHash) {
        dsl.update(APP_USERS)
                .set(APP_USERS.PASSWORD_HASH, passwordHash)
                .where(APP_USERS.USERNAME.eq(username))
                .execute();
    }

    public Optional<String> getUserRoleById(Long userId) {
        return dsl.selectFrom(APP_USERS)
                .where(APP_USERS.ID.eq(userId))
                .fetchOptional(APP_USERS.ROLE);
    }

    public Optional<AppUsersRecord> getOneById(Long userId) {
        return dsl.selectFrom(APP_USERS)
                .where(APP_USERS.ID.eq(userId))
                .fetchOptional();
    }
}
