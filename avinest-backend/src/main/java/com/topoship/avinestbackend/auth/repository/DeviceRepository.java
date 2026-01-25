package com.topoship.avinestbackend.auth.repository;

import com.topoship.jooq.generated.tables.records.DevicesRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static com.topoship.jooq.generated.tables.Devices.DEVICES;

@Repository
public class DeviceRepository {

    private final DSLContext dsl;

    public DeviceRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<DevicesRecord> findByUserAndDeviceInfo(Long userId, String userAgent, String ipAddress) {
        return Optional.ofNullable(
                dsl.selectFrom(DEVICES)
                        .where(DEVICES.USER_ID.eq(userId))
                        .and(DEVICES.USER_AGENT.eq(userAgent))
                        .and(DEVICES.IP_ADDRESS.eq(ipAddress))
                        .fetchOne()
        );
    }

    public UUID createDevice(Long userId, String userAgent, String ipAddress, String deviceName) {
        return dsl.insertInto(DEVICES)
                .set(DEVICES.USER_ID, userId)
                .set(DEVICES.USER_AGENT, userAgent)
                .set(DEVICES.IP_ADDRESS, ipAddress)
                .set(DEVICES.DEVICE_NAME, deviceName)
                .set(DEVICES.FIRST_SEEN, LocalDateTime.now())
                .set(DEVICES.LAST_SEEN, LocalDateTime.now())
                .returning(DEVICES.DEVICE_ID)
                .fetchOne()
                .getDeviceId();
    }

    public void updateLastSeen(UUID deviceId, LocalDateTime lastSeen) {
        dsl.update(DEVICES)
                .set(DEVICES.LAST_SEEN, lastSeen)
                .where(DEVICES.DEVICE_ID.eq(deviceId))
                .execute();
    }
}
