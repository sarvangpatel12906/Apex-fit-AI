export default function Stats() {
  const stats = [
    {
      number: "10K+",
      title: "Workouts Generated",
    },
    {
      number: "98%",
      title: "AI Prediction Accuracy",
    },
    {
      number: "24/7",
      title: "AI Fitness Coach",
    },
    {
      number: "15+",
      title: "Health Metrics Tracked",
    },
  ];

  return (
    <section
      style={{
        padding: "70px 8%",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "30px",
        }}
      >
        {stats.map((item) => (
          <div
            key={item.title}
            style={{
              textAlign: "center",
              padding: "40px",
              borderRadius: "20px",
              background: "#F8FAFC",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                fontSize: "42px",
                color: "#22C3FF",
                marginBottom: "10px",
              }}
            >
              {item.number}
            </h2>

            <p
              style={{
                color: "#475569",
                fontSize: "18px",
              }}
            >
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}