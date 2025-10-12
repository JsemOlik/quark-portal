<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #FFF5EB;
            border-left: 4px solid #FF9F66;
            padding: 20px;
            margin-bottom: 20px;
        }
        .content {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin: 0; color: #4A3728;">{{ config('app.name') }}</h2>
    </div>

    <div class="content">
        {!! nl2br(e($emailMessage)) !!}
    </div>

    <div class="footer">
        <p>This email was sent from <a href="{{ config('app.url') }}">{{ config('app.name') }}</a>.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Do not reply to this email; it is not monitored by our staff.</p>

    </div>
</body>
</html>
