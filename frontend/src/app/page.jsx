'use client';

import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen bg-[#242424] text-white">
            <div className="flex min-h-screen flex-col items-center justify-center">

                {/* Welcome heading */}
                <h1
                    className="text-center font-bold uppercase"
                    style={{
                        fontSize: '80px',
                        fontWeight: 'bolder',
                        fontFamily: 'monospace',
                        letterSpacing: '7px',
                        padding: '40px',
                        whiteSpace: 'nowrap',
                        background:
                            'linear-gradient(90deg, #b8b8ff 0%, #3333ff 35%, #b8b8ff 70%, #ffffff 100%)',
                        backgroundSize: '200% 100%',
                        backgroundPosition: '0% 50%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',

                        animation: 'shine 3s infinite linear',
                    }}
                >
                    Welcome to Gstar Business
                </h1>

                {/* Buttons */}
                <div
                    className="flex flex-col items-center justify-center gap-4 md:flex-row"
                    style={{
                        marginTop: '30px',
                    }}
                >
                    {/* Order Management */}
                    <Link href="/om/login">
                        <button
                            type="button"
                            className="text-white"
                            style={{
                                width: '500px',
                                height: '100px',
                                backgroundColor: '#002c8a',
                            }}
                        >
                            <h2>Order Management</h2>
                        </button>
                    </Link>

                    {/* E-commerce Management */}
                    <Link href="/em/login">
                        <button
                            type="button"
                            className="text-white"
                            style={{
                                width: '500px',
                                height: '100px',
                                backgroundColor: '#002c8a',
                            }}
                        >
                            <h2>E-commerce Management</h2>
                        </button>
                    </Link>
                </div>
            </div>

            <style jsx>{`
                @keyframes shine {
                    0% {
                        background-position: 0% 50%;
                    }

                    60% {
                        background-position: 100% 50%;
                    }

                    100% {
                        background-position: 200% 50%;
                    }
                }

                @media (max-width: 1100px) {
                    h1 {
                        font-size: 50px !important;
                    }

                    button {
                        width: 400px !important;
                    }
                }

                @media (max-width: 700px) {
                    h1 {
                        font-size: 35px !important;
                        letter-spacing: 3px !important;
                        white-space: normal !important;
                    }

                    button {
                        width: 90vw !important;
                        max-width: 500px;
                    }
                }
            `}</style>
        </main>
    );
}