import jwt
from cryptography.fernet import Fernet
import secrets

JWT_SECRET = secrets.token_hex(32)  # Generates a 64-character hexadecimal string
cipher_suite = Fernet(Fernet.generate_key())
def create_html_template(password):
    
    # print('jwt_secret:',JWT_SECRET)
    # token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    # print("new token=",token)
    
    # encrypted_token = cipher_suite.encrypt(token.encode()).decode()
    html_upper='''
    <!DOCTYPE html>
    
  
    < Create a Welcome HTML and place it here >
    '''
    html_lower='''
            <p>Click the button below to verify your email.</p>
            <p>__token__</p>
            <form action="http://127.0.0.1:8000/authentication/verify_mail" method="post">
                <input type="hidden" name="token" >
                <button type="submit" class="button">Verify Email</button>
            </form>
        </div>
        <div class="footer">
            <p>Thank you for joining Ettara Cafe!</p>
            <p>If you did not sign up for this account, please ignore this email.</p>
        </div>
    </div>
</body>
</html>

    '''

    return html_upper+html_lower.replace('__token__',password)


# verification.py
def decrypt_token(enc_token):
    try:
        dec_token=cipher_suite.decrypt(enc_token.encode()).decode()
        payload = jwt.decode(dec_token, JWT_SECRET, algorithms=['HS256'])
        return {'payload':payload,'status':True}
    except:
        return {'status':False}
