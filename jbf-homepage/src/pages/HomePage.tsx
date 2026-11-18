import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { tokenStore } from "../api/http";

const ANGULAR_DASHBOARD_URL =
	import.meta.env.VITE_ANGULAR_DASHBOARD_URL ??
	"http://localhost:4200/dashboard";

export default function HomePage() {
	const { user, loading } = useAuth();

	useEffect(() => {
		if (user) {
			const token = tokenStore.get();
			window.location.href = `${ANGULAR_DASHBOARD_URL}?token=${encodeURIComponent(token || "")}`;
		}
	}, [user]);

	if (loading) return null;
	if (!user) return <Navigate to="/login" replace />;

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				color: "#fff",
			}}
		>
			<p>Redirecting to Jibonbindu Dashboard…</p>
		</div>
	);
}
