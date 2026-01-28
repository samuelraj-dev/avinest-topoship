package com.topoship.avinestbackend.services;

import java.util.Map;

public class DayNormalizer {
    private static final Map<String, String> MAP = Map.ofEntries(
            Map.entry("monday", "MON"),
            Map.entry("tuesday", "TUE"),
            Map.entry("wednesday", "WED"),
            Map.entry("thursday", "THU"),
            Map.entry("friday", "FRI"),
            Map.entry("saturday", "SAT")
    );

    public static String normalize(String raw) {
        String val = MAP.get(raw.trim());
        if (val == null) {
            throw new IllegalStateException("Unknown day: " + raw);
        }
        return val;
    }
}
