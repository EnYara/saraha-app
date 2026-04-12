export const emailTemplate = (otp) => {    
    return`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Message</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; margin:30px; border-radius:10px;">
          
          <!-- Header -->
          <tr>
            <td style="background:#6C63FF; padding:20px; text-align:center; color:white;">
              <h2>📩 New Message</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px; color:#333;">
              
              <p>You received a new anonymous message 👀</p>

              <div style="background:#f9f9f9; padding:15px; border-left:4px solid #6C63FF; margin:15px 0;">
                <p>your OTP is: ${otp}</p>
              </div>

              <p>Check your inbox to see more 😉</p>

              <div style="text-align:center; margin-top:20px;">
                <a href="{{link}}" 
                   style="background:#6C63FF; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
                   View Messages
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f1f1; text-align:center; padding:10px; font-size:12px; color:#777;">
              Saraha App © 2026
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`

}