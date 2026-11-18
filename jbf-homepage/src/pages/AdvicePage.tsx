import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

/** Placeholder: the API has no endpoint for advice / feedback yet. */
export default function AdvicePage() {
  return (
    <AuthLayout
      title="Your advice"
      text="We would love to hear how we can improve."
    >
      <p>This page is not available yet.</p>
      <Link className="btn btn-jbf w-100" to="/">
        Back to home
      </Link>
    </AuthLayout>
  );
}
