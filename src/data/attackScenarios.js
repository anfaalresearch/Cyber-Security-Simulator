
export const attackScenarios = [
  {
    id: "otp-scam",
    title: "OTP Interception Scam",
    icon: "📱",
    description:
      "Someone calls claiming to be from your bank and asks for the OTP code you just received.",
    steps: [
      {
        prompt:
          "You receive a call: 'Hi, this is your bank's fraud department. We detected suspicious activity. I just sent you a verification code — please read it to me so we can secure your account.' An SMS with a 6-digit code arrives.",
        choices: [
          {
            text: "Read the OTP code to the caller",
            score: 0,
            feedback:
              "Never share OTP codes with anyone. Banks never ask for your OTP over the phone.",
          },
          {
            text: "Hang up and call your bank using the number on your card",
            score: 10,
            feedback:
              "Correct! Always verify by calling the official number. The caller was impersonating your bank.",
          },
          {
            text: "Ask them to verify their employee ID first",
            score: 3,
            feedback:
              "Scammers can use fake credentials. Always call back using the official number.",
          },
          {
            text: "Enter the code on your banking app yourself",
            score: 5,
            feedback:
              "Good instinct, but hang up and verify the call independently.",
          },
        ],
      },
      {
        prompt:
          "You hang up. Moments later, you receive an SMS alert saying an unfamiliar login attempt was made on your bank account. What should you do?",
        choices: [
          {
            text: "Ignore it because you did not share the OTP",
            score: 0,
            feedback:
              "Ignoring suspicious login alerts can allow attackers to continue attempting access.",
          },
          {
            text: "Open the official banking app and check account activity",
            score: 10,
            feedback:
              "Excellent! Verify alerts through official banking channels.",
          },
          {
            text: "Click the link in the SMS to secure your account",
            score: 0,
            feedback:
              "The message could itself be phishing. Avoid unknown links.",
          },
          {
            text: "Reply to the SMS asking who attempted the login",
            score: 2,
            feedback:
              "Never rely on replying to suspicious messages. Contact your bank independently.",
          },
        ],
      },
      {
        prompt:
          "You discover another suspicious transaction attempt. What is the best final response?",
        choices: [
          {
            text: "Wait and see whether the transaction succeeds",
            score: 0,
            feedback:
              "Waiting gives attackers more time to compromise your account.",
          },
          {
            text: "Contact your bank through its official fraud helpline, secure the account and report the incident",
            score: 10,
            feedback:
              "Excellent response! Contacting the bank immediately helps prevent financial loss.",
          },
          {
            text: "Share the suspicious SMS with the caller for clarification",
            score: 0,
            feedback:
              "Never reconnect with a suspected scammer.",
          },
          {
            text: "Change your banking password using an unfamiliar SMS link",
            score: 2,
            feedback:
              "Use the official banking application or website, never an unverified link.",
          },
        ],
      },
    ],
    bestAction:
      "Never share OTP codes. Verify alerts independently, contact your bank's official fraud helpline and secure your account.",
  },

  {
    id: "qr-scam",
    title: "Malicious QR Code",
    icon: "📷",
    description:
      "You find a QR code sticker placed over a legitimate parking payment QR code.",
    steps: [
      {
        prompt:
          "At a parking garage, you notice a QR code on the payment machine. It looks slightly newer than the rest of the machine. Your phone is ready to scan.",
        choices: [
          {
            text: "Scan the QR code to pay quickly",
            score: 0,
            feedback:
              "The sticker may have been placed by scammers to redirect you to a fake payment page.",
          },
          {
            text: "Check for a sticker overlay and use the official parking app instead",
            score: 10,
            feedback:
              "Excellent! QR sticker scams are common. Always use official apps or websites for payments.",
          },
          {
            text: "Scan it but use a prepaid card with limited funds",
            score: 2,
            feedback:
              "Still risky. The fake site may collect personal information beyond payment details.",
          },
          {
            text: "Ask a stranger nearby if the QR code works",
            score: 1,
            feedback:
              "Others may be victims too. Verify through official channels.",
          },
        ],
      },
      {
        prompt:
          "You inspect the QR code and notice that it is a sticker covering another code. You already scanned it, and a payment website has opened. What should you do?",
        choices: [
          {
            text: "Enter your card details because the website looks professional",
            score: 0,
            feedback:
              "Fake payment websites often copy legitimate designs to steal financial information.",
          },
          {
            text: "Close the page without entering any information and verify the payment method with parking staff",
            score: 10,
            feedback:
              "Correct! Never enter sensitive details on an unverified payment page.",
          },
          {
            text: "Share the website link with friends to check if it is safe",
            score: 2,
            feedback:
              "Sharing a suspicious link can expose others to the same threat.",
          },
          {
            text: "Refresh the page and try again",
            score: 0,
            feedback:
              "Refreshing does not establish whether the website is legitimate.",
          },
        ],
      },
      {
        prompt:
          "You report the suspicious QR sticker to the parking staff. What additional action helps protect other visitors?",
        choices: [
          {
            text: "Remove the sticker yourself and leave",
            score: 4,
            feedback:
              "Reporting is important, but let authorized staff handle the suspicious payment equipment.",
          },
          {
            text: "Inform the staff and ask them to disable the affected payment point until it is checked",
            score: 10,
            feedback:
              "Excellent! This helps prevent other visitors from becoming victims.",
          },
          {
            text: "Ignore it because you did not enter your card details",
            score: 0,
            feedback:
              "Reporting suspicious QR codes helps protect the wider community.",
          },
          {
            text: "Post the QR code online without warning anyone",
            score: 2,
            feedback:
              "A clear warning and direct report to the responsible staff are more useful.",
          },
        ],
      },
    ],
    bestAction:
      "Inspect QR codes for sticker overlays, use official payment apps and report suspicious payment equipment.",
  },

  {
    id: "tech-support",
    title: "Fake Tech Support",
    icon: "🖥️",
    description:
      "A pop-up claims your computer is infected and displays a support phone number.",
    steps: [
      {
        prompt:
          "While browsing, a full-screen warning appears: 'CRITICAL ALERT: 47 viruses detected! Your personal data is at risk. Call Microsoft Support immediately: 1-800-XXX-XXXX. Do not shut down your computer.'",
        choices: [
          {
            text: "Call the number immediately",
            score: 0,
            feedback:
              "This is a scareware pop-up. The fake technicians may request remote access and payment.",
          },
          {
            text: "Close the browser tab using Task Manager and run a legitimate antivirus scan",
            score: 10,
            feedback:
              "Perfect! Real security warnings do not appear as browser pop-ups with support phone numbers.",
          },
          {
            text: "Click 'Remove Viruses Now' on the pop-up",
            score: 0,
            feedback:
              "The button may download malware or redirect you to a phishing payment page.",
          },
          {
            text: "Restart your computer and call the number if it appears again",
            score: 2,
            feedback:
              "Never call numbers displayed in suspicious pop-ups.",
          },
        ],
      },
      {
        prompt:
          "The pop-up disappears, but another window asks you to download a remote support application. What should you do?",
        choices: [
          {
            text: "Install it so the technician can investigate",
            score: 0,
            feedback:
              "Remote access software can allow scammers to control your computer.",
          },
          {
            text: "Cancel the download and avoid granting remote access to an unverified person",
            score: 10,
            feedback:
              "Correct! Never grant remote access to unsolicited technical support callers.",
          },
          {
            text: "Download it but do not open it yet",
            score: 2,
            feedback:
              "Downloading unknown software is still unnecessary and risky.",
          },
          {
            text: "Ask the pop-up to provide proof that it is genuine",
            score: 1,
            feedback:
              "A fake warning can display convincing but fabricated information.",
          },
        ],
      },
      {
        prompt:
          "You suspect that the pop-up attempted to install unwanted software. What should you do next?",
        choices: [
          {
            text: "Ignore it because the pop-up has disappeared",
            score: 0,
            feedback:
              "The disappearance of a pop-up does not guarantee your computer is safe.",
          },
          {
            text: "Run a trusted security scan, check installed applications and remove suspicious software",
            score: 10,
            feedback:
              "Excellent! A trusted security scan and application review help identify potential threats.",
          },
          {
            text: "Call the displayed support number to confirm",
            score: 0,
            feedback:
              "Do not contact the number displayed in the suspicious warning.",
          },
          {
            text: "Disable your antivirus to prevent further pop-ups",
            score: 0,
            feedback:
              "Disabling security protection makes your computer more vulnerable.",
          },
        ],
      },
    ],
    bestAction:
      "Close scareware pop-ups, never grant unsolicited remote access and scan your computer using trusted security software.",
  },

  {
    id: "public-wifi",
    title: "Public WiFi Eavesdropping",
    icon: "📡",
    description:
      "You connect to free WiFi at a coffee shop to check your email and banking.",
    steps: [
      {
        prompt:
          "At a café, you see two WiFi networks: 'Cafe_Free_WiFi' and 'Cafe-Free-WiFi-Secure'. You need to check your bank balance urgently.",
        choices: [
          {
            text: "Connect to either network and log into banking",
            score: 0,
            feedback:
              "One network may be an attacker's hotspot (evil twin attack). Your credentials could be intercepted.",
          },
          {
            text: "Use mobile data or a trusted VPN, then access banking",
            score: 10,
            feedback:
              "Correct! Mobile data or a trusted VPN provides safer access than an unknown WiFi network.",
          },
          {
            text: "Connect to the 'Secure' one since it says secure",
            score: 2,
            feedback:
              "Network names are easily faked. 'Secure' in the name does not guarantee legitimacy.",
          },
          {
            text: "Connect but only check non-sensitive sites",
            score: 5,
            feedback:
              "Better, but you should still verify that the network is legitimate.",
          },
        ],
      },
      {
        prompt:
          "You connect to the café network. A login page appears asking for your email password before granting internet access. What should you do?",
        choices: [
          {
            text: "Enter your email password to continue",
            score: 0,
            feedback:
              "Public WiFi login pages should not require your personal email password.",
          },
          {
            text: "Avoid entering credentials and verify the network with café staff",
            score: 10,
            feedback:
              "Excellent! Verify captive portals through trusted staff and never share unrelated account credentials.",
          },
          {
            text: "Use the same password you use for other accounts",
            score: 0,
            feedback:
              "Reusing passwords increases the impact of credential theft.",
          },
          {
            text: "Enter a random password and see what happens",
            score: 2,
            feedback:
              "Do not interact with suspicious login pages. Verify the network first.",
          },
        ],
      },
      {
        prompt:
          "You discover that the network may have been an evil twin hotspot. What should you do now?",
        choices: [
          {
            text: "Continue using the network because it is convenient",
            score: 0,
            feedback:
              "Continuing to use a suspicious network exposes your device to further risks.",
          },
          {
            text: "Disconnect, forget the network, and change any credentials that may have been exposed using a trusted connection",
            score: 10,
            feedback:
              "Excellent! Disconnecting and securing potentially exposed accounts reduces further risk.",
          },
          {
            text: "Share the WiFi password with other visitors",
            score: 0,
            feedback:
              "This could expose more people to the same malicious hotspot.",
          },
          {
            text: "Reconnect using a different device",
            score: 2,
            feedback:
              "Changing devices does not make a malicious network safe.",
          },
        ],
      },
    ],
    bestAction:
      "Avoid sensitive transactions on unknown public WiFi. Verify networks, use mobile data or a trusted VPN and secure exposed accounts.",
  },

  {
    id: "social-engineering",
    title: "Social Engineering — Tailgating",
    icon: "🚪",
    description:
      "A well-dressed stranger asks you to hold the door to a secure office building.",
    steps: [
      {
        prompt:
          "You're entering your office building using your badge. A person in a suit carrying coffee says, 'Hey, I forgot my badge in the meeting room. Can you hold the door? I'll just be a minute.'",
        choices: [
          {
            text: "Hold the door — they look professional",
            score: 0,
            feedback:
              "This is tailgating. Attackers may exploit courtesy to gain unauthorized access.",
          },
          {
            text: "Politely decline and let them use the reception guest process",
            score: 10,
            feedback:
              "Correct! Legitimate visitors should follow proper check-in procedures.",
          },
          {
            text: "Hold the door but escort them to reception",
            score: 7,
            feedback:
              "Better than allowing unrestricted access, but direct them to reception without opening the secure door.",
          },
          {
            text: "Ignore them completely",
            score: 5,
            feedback:
              "You avoided unauthorized access. Directing them to reception is more helpful.",
          },
        ],
      },
      {
        prompt:
          "The stranger says they are an employee and shows you a photograph of an employee badge on their phone. What should you do?",
        choices: [
          {
            text: "Allow them in because the badge looks genuine",
            score: 0,
            feedback:
              "A photograph of a badge does not prove identity or authorization.",
          },
          {
            text: "Ask them to verify their access through reception or an authorized security officer",
            score: 10,
            feedback:
              "Excellent! Access must be verified through official procedures.",
          },
          {
            text: "Take a photograph of their badge and let them enter",
            score: 1,
            feedback:
              "A photograph does not establish whether the badge is valid.",
          },
          {
            text: "Ask another employee to let them in",
            score: 2,
            feedback:
              "Passing the decision to another person does not replace proper verification.",
          },
        ],
      },
      {
        prompt:
          "Security staff confirm that the visitor is unauthorized. What is the best response?",
        choices: [
          {
            text: "Confront the person physically",
            score: 0,
            feedback:
              "Do not put yourself at risk. Leave intervention to authorized security personnel.",
          },
          {
            text: "Report the incident to building security and follow the organization's access-control procedure",
            score: 10,
            feedback:
              "Excellent! Reporting the incident helps security staff investigate and prevent future attempts.",
          },
          {
            text: "Ignore the incident because security has already handled it",
            score: 2,
            feedback:
              "Reporting what you observed can help with incident documentation.",
          },
          {
            text: "Post the visitor's photograph on social media",
            score: 0,
            feedback:
              "Avoid sharing personal information publicly. Use official reporting channels.",
          },
        ],
      },
    ],
    bestAction:
      "Never badge in strangers. Verify visitors through reception, follow access-control procedures and report suspicious activity.",
  },
];
