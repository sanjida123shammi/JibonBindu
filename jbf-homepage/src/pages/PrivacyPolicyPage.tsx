import { Link } from 'react-router-dom'

/** Placeholder text: replace it with the foundation's real privacy policy. */
export default function PrivacyPolicyPage() {
  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <h1 className="h3 mb-3">Privacy Policy</h1>
      <p>
        Jibonbindu Foundation collects your name, email address and the details you enter for blood requests,
        blood donation and fund donation, only to run the foundation's services.
      </p>
      <p>
        Donor contact details are shared only with the foundation's administrators and approved members who
        match donors with patients. We do not sell your data.
      </p>
      <p className="text-muted">TODO: replace this text with the final policy approved by the foundation.</p>
      <Link to="/register">Back to registration</Link>
    </div>
  )
}
