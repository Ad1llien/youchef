// OfflinePage.jsx
export default function OfflinePage() {
    return (
      <div style={styles.container}>
        <h1>Нет подключения к интернету</h1>
        <p>Проверь Wi-Fi или мобильные данные</p>
      </div>
    );
  }
  
  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "20px",
      color: "#333",
    },
  };