import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/signup.css';

type SignUpInfo = {
    name: string,
    email: string,
    dob: string,
    password: string
}

export function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [signup, SetSignUp] = useState<SignUpInfo>({
        name: "",
        email: "",
        dob: "",
        password: ""
    });


    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        SetSignUp({ ...signup, [name]: value })
    };

    const handleSubmit = async() => {
        if (signup.name.trim() === "" || signup.dob.trim() === "" || signup.email.trim() === "" || signup.password.trim() === "") return;
        
        //Link to backend
        try{

            const response = await fetch('http://localhost:5000/signup', {
                method: "POST",
                headers: {
                    "Content-type": "application/JSON"
                },
                body: JSON.stringify(signup)
            });
            const data = await response.json();

            if (!response.ok) {
                alert(data?.message || "Sign-up failed");
                return;
            }

            if (data?.token) {
                sessionStorage.setItem("token", data.token);
            }

            console.log(data)

            // token is stored — now move to the tools
            navigate("/app", { replace: true });
        }
        catch(err){
            console.error(`oops.. something went wrong ${err}`);
            alert(`Could not reach the auth server: ${err}`);
        }
    }

    const handleEnterKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSubmit();
        }
    }

    return (
        <div className="page">
            <div className="header-portion">
                <h1 className="h1_page">Welcome To LinkCode</h1>
                <p>This App is one you needed to disturb your link</p>
                <h4 className="h4_desc">Sign-up to join LinkCode</h4>
            </div>
            <div className="ex-note">
                <div className="p-note">
                    <strong>Thank You for Choosing LinkCode</strong>
                    <p>We are pleased to welcome you to LinkCode. Your registration has been successfully completed, and your account is now active.</p>
                    <p>We appreciate your trust in our platform and look forward to serving you. You may now sign in and begin exploring all that LinkCode has to offer.</p>
                    <p>Should you require any assistance, our support team is always at your service.</p>
                    <br />
                    <p>Warm regards,<br /><strong>The LinkCode Team</strong></p>
                </div>
            </div>
            <div className="body-portion">
                <h3 className="name_inp">Username: </h3>
                <input name="name" onChange={handleInput} value={signup.name} type="text" placeholder="Enter Your Name: " />

                <h3 className="age_inp">Date of Birth: </h3>
                <input name="dob" onChange={handleInput} value={signup.dob} type="date" placeholder="Enter Your Age: " />

                <h3 className="email_inp">Email: </h3>
                <input name="email" onChange={handleInput} value={signup.email} type="email" placeholder="Enter Your email: " />

                <h3 className="pass_inp">Password: </h3>
        
                <div className="pass-wrapper">
                    <input
                        value={signup.password}
                        name="password"
                        onKeyDown={handleEnterKey}
                        onChange={handleInput}
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


                <Link to="/login">Already a User? Login</Link>

                <div className="sry-btn">
                    <button onClick={handleSubmit} >Sign-UP</button>
                </div>
            </div>
        </div>
    )
}