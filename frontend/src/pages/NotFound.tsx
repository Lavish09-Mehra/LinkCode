import { useNavigate } from "react-router-dom";

export function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <style>{`
                .not_found {
                    min-height: 100vh;
                    width: 100%;
                    background: #ffffff;

                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;

                    text-align: center;
                    font-family: Arial, sans-serif;
                }

                .not_found h1 {
                    margin: 0;
                    font-size: 42px;
                    font-weight: 600;
                    color: #111111;
                }

                .not_found p {
                    margin: 12px 0 28px;
                    font-size: 16px;
                    color: #777777;
                }

                .not_found button {
                    padding: 12px 22px;
                    border: 1px solid #111111;
                    border-radius: 6px;

                    background: #111111;
                    color: #ffffff;

                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .not_found button:hover {
                    background: #ffffff;
                    color: #111111;
                }
            `}</style>

            <div className="not_found">
                <h1>404</h1>

                <p>
                    The page you're looking for doesn't exist.
                </p>

                <button onClick={() => navigate("/")}>
                    Return to Home
                </button>
            </div>
        </>
    );
}
