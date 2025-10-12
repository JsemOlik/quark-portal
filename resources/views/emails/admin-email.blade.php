<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            background-color: #110F0D;
            padding: 40px 20px;
            margin: 0;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #110F0D;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        .header {
            background: #110F0D;
            padding: 40px 30px 30px 30px;
            text-align: center;
            position: relative;
        }
        .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
        }
        .logo {
            font-size: 32px;
            font-weight: 700;
            color: #FFEDD9;
            letter-spacing: -0.5px;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .subtitle {
            color: #FFEDD9;
            font-size: 14px;
            opacity: 0.8;
        }
        .content {
            padding: 20px 30px;
            color: #FFEDD9;
            font-size: 15px;
            line-height: 1.8;
            white-space: pre-wrap;
            word-wrap: break-word;
            background: #110F0D;
        }
        .content p {
            margin-bottom: 12px;
        }
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, #FF9F66 50%, transparent 100%);
            margin: 0;
        }
        .footer {
            background-color: #110F0D;
            padding: 20px 30px 30px 30px;
            text-align: center;
        }
        .footer p {
            color: #FFEDD9;
            font-size: 13px;
            margin: 8px 0;
            opacity: 0.8;
        }
        .footer a {
            color: #FF9F66;
            text-decoration: none;
            font-weight: 600;
            transition: opacity 0.2s;
        }
        .footer a:hover {
            opacity: 0.8;
            text-decoration: underline;
        }
        .brand-badge {
            display: inline-block;
            background: linear-gradient(135deg, #FF9F66 0%, #FFB380 100%);
            color: #110F0D;
            padding: 6px 14px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 10px;
        }
        @media only screen and (max-width: 600px) {
            body {
                padding: 20px 10px;
            }
            .email-wrapper {
                border-radius: 12px;
            }
            .header {
                padding: 30px 20px;
            }
            .content {
                padding: 30px 20px;
            }
            .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <div class="logo-container">
                <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ee8132" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"/>
                    <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
                    <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
                </svg>
                <h1 class="logo">{{ config('app.name') }}</h1>
            </div>
            <p class="subtitle">Game Server Hosting</p>
        </div>

        <div class="divider"></div>

        <div class="content">
            {!! nl2br(e($emailMessage)) !!}
        </div>

        <div class="divider"></div>

        <div class="footer">
            <p>
                Visit us at <a href="{{ config('app.url') }}">{{ config('app.url') }}</a>
            </p>
            <p>
                If you have any questions, please contact our support team.
            </p>
            <p style="font-size: 11px; margin-top: 15px;">
                <strong>Do not reply to this email</strong> - it is not monitored by our staff.
            </p>
        </div>
    </div>
</body>
</html>
