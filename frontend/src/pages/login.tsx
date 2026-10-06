import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/login.css';
type LoginInfo = {
    email: string,
    password: string
}
export function LoginUserInfo() {
    const [showPassword, setShowPassword] = useState(false);

    const [login, SetLogin] = useState<LoginInfo>({
        email: "",
        password: ""
    });

    const handleLoginInput = (event: React.ChangeEvent<HTMLInputElement>) => {

        const { name, value } = event.target
        SetLogin({ ...login, [name]: value });
    }

    const handleSubmitLoginButton = async () => {
        if (login.email.trim() === "" || login.password.trim() === "") return;

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: "POST",
                headers: {
                    "Content-type": "application/JSON"
                },
                body: JSON.stringify(login)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data?.message || "Login failed");
                return;
            }
            if (data?.token) {
                sessionStorage.setItem("token", data.token);
            }
            console.log(data)

        }
        catch (err) {
            console.error(`oops.. something went wrong ${err}`);
            alert(`Could not reach the auth server: ${err}`);
        }
    }

    const handleEnterKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSubmitLoginButton();
        }
    }

    return (
        <div className="Login_page">
            <div className="header-portion">
                <h1 className="h1_LoginPage">Welcome Back To LinkCode</h1>
                <p className="p_LoginPage">Great to see you again. Your links are right where you left them.</p>
                <h4 className="h4_LoginPage">Login to Re-join the LinkCode</h4>
            </div>
            <div className="ex_note">
                <div className="p_note">
                    <strong>Good to Have You Back</strong>
                    <p>We're glad to see you again at LinkCode. Sign in with your registered email and password to pick up right where you left off.</p>
                    <p>Your account and all your saved links are safe and waiting for you. If you've forgotten your password, please contact our support team and we'll help you regain access.</p>
                    <br />
                    <p>Warm regards,<br /><strong>The LinkCode Team</strong></p>
                </div>
            </div>
            <div className="body_LoginPage">
                <h3 className="email_inp">Email: </h3>
                <input onKeyDown={handleEnterKey} value={login.email} name="email" onChange={handleLoginInput} type="email" placeholder="Enter Your email: " />

                <h3 className="pass_inp">Password: </h3>
                <div className="pass-wrapper">
                    <input
                        value={login.password}
                        name="password"
                        onKeyDown={handleEnterKey}
                        onChange={handleLoginInput}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Your password: "
                    />
                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(prev => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            /* eye-off icon */
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            /* eye icon */
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                </div>

                <Link to="/signup">New User? SignUp</Link>

                <div className="sry-btn">
                    <button className="btn-login" onClick={handleSubmitLoginButton}>Login</button>
                </div>
            </div>
        </div>
    )
}