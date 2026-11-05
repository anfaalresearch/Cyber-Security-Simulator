export const incidentScenarios = [
    {
        id: "suspicious-login",
        title: "Suspicious Account Activity",
        difficulty: "Beginner",
        description: "Investigate unusual login activity involving a fictional employee account.",
        objective: "Determine whether the account activity is suspicious.",
        conclusion:
            "Multiple failed login attempts were followed by a successful login from an unfamiliar IP address. This pattern warrants further investigation because the account may have been compromised.",
        expectedAssessment: "suspicious",
        expectedEvidenceIds: ["event-002", "event-003"],

        events: [
            {
                id: "event-001",
                timestamp: "2026-10-15T09:00:00Z",
                source: "Authentication Log",
                type: "login",
                severity: "info",
                user: "alex.morgan",
                ip: "192.0.2.10",
                description: "Successful login from the employee's usual location.",
            },
            {
                id: "event-002",
                timestamp: "2026-10-15T09:15:00Z",
                source: "Authentication Log",
                type: "failed-login",
                severity: "warning",
                user: "alex.morgan",
                ip: "198.51.100.25",
                description: "Multiple unsuccessful login attempts detected.",
            },
            {
                id: "event-003",
                timestamp: "2026-10-15T09:18:00Z",
                source: "Authentication Log",
                type: "login",
                severity: "critical",
                user: "alex.morgan",
                ip: "198.51.100.25",
                description: "Successful login from an unfamiliar IP address.",
            },
        ],

        expectedFindings: [
            "Multiple failed login attempts occurred.",
            "A successful login followed from the unfamiliar IP address.",
        ],

        recommendations: [
            "Verify the account activity with its owner.",
            "Reset credentials if compromise is confirmed.",
            "Review authentication logs for additional suspicious activity.",
        ],
    },

    // SECOND SCENARIO
    {
        id: "suspicious-file-access",
        title: "Unusual File Access",
        difficulty: "Intermediate",
        description:
            "Investigate unusual access to a fictional company's sensitive files.",
        objective:
            "Determine whether the employee's file access activity is suspicious.",
        conclusion:
            "The employee account accessed restricted financial records, followed by an unusually large data transfer. These events are concerning and require verification of authorization and the transfer destination.",
        expectedAssessment: "suspicious",
        expectedEvidenceIds: ["event-102", "event-103"],

        events: [
            {
                id: "event-101",
                timestamp: "2026-10-15T10:00:00Z",
                source: "Authentication Log",
                type: "login",
                severity: "info",
                user: "jordan.lee",
                ip: "192.0.2.20",
                description: "Employee successfully logged in using their usual account.",
            },
            {
                id: "event-102",
                timestamp: "2026-10-15T10:12:00Z",
                source: "File Access Log",
                type: "file-access",
                severity: "warning",
                user: "jordan.lee",
                ip: "192.0.2.20",
                description: "Employee account accessed a restricted financial records folder.",
            },
            {
                id: "event-103",
                timestamp: "2026-10-15T10:18:00Z",
                source: "Network Log",
                type: "data-transfer",
                severity: "critical",
                user: "jordan.lee",
                ip: "192.0.2.20",
                description: "Unusually large data transfer detected shortly after restricted file access.",
            },
        ],

        expectedFindings: [
            "The employee account accessed a restricted financial records folder.",
            "A large data transfer occurred shortly after the file access.",
        ],

        recommendations: [
            "Verify whether the employee was authorized to access the files.",
            "Review the data transfer with the security team.",
            "Preserve relevant logs for further investigation.",
        ],
    },

    {
        id: "approved-backup",
        title: "Approved Backup Activity",
        difficulty: "Intermediate",
        description:
            "Investigate unusual file access during a scheduled company backup.",
        objective:
            "Determine whether the activity represents a security incident or legitimate maintenance.",
        conclusion:
            "The backup service authenticated successfully, accessed files during its scheduled task, and transferred data to an approved internal backup server. The available evidence supports legitimate maintenance activity.",
        expectedAssessment: "benign",
        expectedEvidenceIds: ["event-202", "event-203"],

        events: [
            {
                id: "event-201",
                timestamp: "2026-10-16T02:00:00Z",
                source: "Authentication Log",
                type: "login",
                severity: "info",
                user: "backup.service",
                ip: "192.0.2.30",
                description: "Scheduled backup service authenticated successfully.",
            },
            {
                id: "event-202",
                timestamp: "2026-10-16T02:05:00Z",
                source: "File Access Log",
                type: "file-access",
                severity: "info",
                user: "backup.service",
                ip: "192.0.2.30",
                description: "Backup service accessed company files according to its scheduled task.",
            },
            {
                id: "event-203",
                timestamp: "2026-10-16T02:12:00Z",
                source: "Network Log",
                type: "data-transfer",
                severity: "info",
                user: "backup.service",
                ip: "192.0.2.30",
                description: "Expected backup data transfer completed to the approved internal backup server.",
            },
        ],

        expectedFindings: [
            "The backup service authenticated successfully.",
            "File access matched the scheduled backup task.",
            "The data transfer was directed to an approved internal backup server.",
        ],

        recommendations: [
            "Verify backup activity against the approved maintenance schedule.",
            "Ensure backup service permissions remain appropriately restricted.",
            "Continue monitoring backup logs for unexpected changes.",
        ],
    },

    {
        id: "unusual-network-connection",
        title: "Unusual Network Connection",
        difficulty: "Advanced",
        description:
            "Investigate an unfamiliar outbound connection with incomplete supporting evidence.",
        objective:
            "Determine whether the available evidence is sufficient to confirm suspicious activity.",
        conclusion:
            "An unfamiliar external connection and an unverified background application were observed. However, the available logs do not establish whether the activity is malicious or legitimate. More evidence is needed before reaching a definitive conclusion.",
        expectedAssessment: "inconclusive",
        expectedEvidenceIds: ["event-302", "event-303"],

        events: [
            {
                id: "event-301",
                timestamp: "2026-10-17T11:00:00Z",
                source: "Authentication Log",
                type: "login",
                severity: "info",
                user: "casey.ross",
                ip: "192.0.2.40",
                description: "Employee successfully logged in using their usual account.",
            },
            {
                id: "event-302",
                timestamp: "2026-10-17T11:08:00Z",
                source: "Network Log",
                type: "outbound-connection",
                severity: "warning",
                user: "casey.ross",
                ip: "192.0.2.40",
                description: "An unfamiliar external destination was contacted by the employee's device.",
            },
            {
                id: "event-303",
                timestamp: "2026-10-17T11:10:00Z",
                source: "Endpoint Log",
                type: "process-activity",
                severity: "info",
                user: "casey.ross",
                ip: "192.0.2.40",
                description: "A background application was active, but its purpose could not be verified from the available logs.",
            },
        ],

        expectedFindings: [
            "An unfamiliar external destination was contacted.",
            "A background application was active.",
            "The available logs do not establish whether the connection was malicious or legitimate.",
        ],

        recommendations: [
            "Collect additional endpoint and network logs.",
            "Verify the application and destination with the system administrator.",
            "Avoid making a definitive incident classification until more evidence is available.",
        ],
    },


];