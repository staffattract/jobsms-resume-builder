import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>Resume builder</h1>
      <p>
        <Link href="/login">Sign in or register</Link>
        {" · "}
        <Link href="/resumes">Resumes</Link> (requires login)
      </p>
    </main>
  );
}
