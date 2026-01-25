package com.topoship.avinestbackend.auth.service;


import com.topoship.avinestbackend.auth.repository.DeviceRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import ua_parser.Client;
import ua_parser.Parser;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    public UUID getOrCreate(Long userId, HttpServletRequest req) {
        var ua = req.getHeader("User-Agent");
        var ip = req.getRemoteAddr();

        var device = deviceRepository.findByUserAndDeviceInfo(userId, ua, ip);

        if (device.isPresent()) {
            deviceRepository.updateLastSeen(device.get().getDeviceId(), LocalDateTime.now());
            return device.get().getDeviceId();
        }

        var deviceName = parseDeviceName(ua);
        return deviceRepository.createDevice(userId, ua, ip, deviceName);
    }

    private String parseDeviceName(String userAgent) {
        if (userAgent == null) return "Unknown Device";

        Parser uaParser = new Parser();
        Client c = uaParser.parse(userAgent);

        return c.device.family +
                "-" +
                c.os.family +
                "-" +
                c.userAgent.family;
    }
}
