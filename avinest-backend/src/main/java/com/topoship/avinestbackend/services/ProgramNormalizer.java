package com.topoship.avinestbackend.services;

import java.util.HashMap;
import java.util.Map;

public class ProgramNormalizer {

    private static final Map<String, String> MAP = Map.ofEntries(
            Map.entry("B.E. CSE", "CSE"),
            Map.entry("B.E CSE", "CSE"),

            Map.entry("B.Tech. CS & BS", "CSBS"),
            Map.entry("B.Tech CS & BS", "CSBS"),
            Map.entry("B.Tech. CSBS", "CSBS"),

            Map.entry("B.Tech. AI & DS", "AIDS"),
            Map.entry("B.Tech AI & DS", "AIDS"),
            Map.entry("B.Tech. AIDS", "AIDS"),

            Map.entry("B.E. CSE (AI & ML)", "CSE(AIML)"),
            Map.entry("B.E CSE (AI & ML)", "CSE(AIML)"),
            Map.entry("B.E. CSE (AIML)", "CSE(AIML)")
    );


    public static String normalize(String raw) {
        String abbr = MAP.get(raw.trim());
        if (abbr == null) {
            throw new IllegalStateException("Unknown program: " + raw);
        }
        return abbr;
    }
}
