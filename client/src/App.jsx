
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://68.210.184.103:5000"
).replace(/\/+$/, "");

async function fetchStats() {
  const response = await fetch(`${API_BASE_URL}/api/stats`);
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const result = await response.json();
      throw new Error(result.error || `Erreur HTTP ${response.status}`);
    }

    throw new Error(
      `Erreur HTTP ${response.status} sur ${API_BASE_URL}/api/stats. Vérifiez que cette route existe sur le backend.`
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Réponse inattendue du backend sur ${API_BASE_URL}/api/stats : du JSON était attendu.`
    );
  }

  const result = await response.json();
  const statistics = [
    ["total_continents", result.total_continents],
    ["total_countries", result.total_countries],
    ["total_population", result.total_population],
  ];

  for (const [name, value] of statistics) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
      throw new Error(`La statistique "${name}" est absente ou invalide.`);
    }
  }

  return {
    totalContinents: Number(result.total_continents),
    totalCountries: Number(result.total_countries),
    totalPopulation: Number(result.total_population),
  };
}

function getRequestErrorMessage(requestError) {
  const details =
    requestError instanceof Error ? requestError.message : "Erreur inconnue";

  return requestError instanceof TypeError
    ? `Impossible de joindre l'API (${API_BASE_URL}). Vérifiez que le backend fonctionne et que l'adresse IP de la VM et le port 5000 sont accessibles depuis le navigateur. Détail : ${details}`
    : details;
}

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadData = useCallback(async () => {
    try {
      const result = await fetchStats();
      setData(result);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadInitialData() {
      try {
        const result = await fetchStats();
        if (isCurrent) {
          setData(result);
          setLastUpdated(new Date());
        }
      } catch (requestError) {
        if (isCurrent) {
          setError(getRequestErrorMessage(requestError));
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    void loadInitialData();
    return () => {
      isCurrent = false;
    };
  }, []);

  function refreshData() {
    setLoading(true);
    setError("");
    void loadData();
  }

  if (error) {
    return (
      <main className="message-page">
        <div className="message-box">
          <span className="message-icon">!</span>
          <h2>Impossible de charger les données</h2>
          <p>{error}</p>
          <button
            className="primary-button"
            onClick={refreshData}
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  if (!data && loading) {
    return (
      <main className="message-page">
        <div className="loading-spinner" />
        <p>Chargement de votre tableau de bord...</p>
      </main>
    );
  }

  return (
    <div className="app-layout">
      {/* MENU LATÉRAL */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <span>☁</span>
          </div>

          <div>
            <h2>
              Cloud<span>Panel</span>
            </h2>
            <p>WORLD STATISTICS</p>
          </div>
        </div>

        <div className="nav-label">MENU PRINCIPAL</div>

        <nav className="navigation">
          <button className="nav-link active">
            <span className="nav-icon">▦</span>
            <span>Tableau de bord</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-card">
            <div className="connection-heading">
              <span className="status-dot" />
              <span>API de la VM</span>
            </div>

            <strong>Backend Flask</strong>
            <p>Statistiques du monde</p>

            <div className="connection-status">● API connectée</div>
          </div>

          <div className="sidebar-footer">
            <span className="footer-cloud">☁</span>
            <div>
              <strong>Cloud Computing</strong>
              <p>Projet universitaire</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>
              Tableau de bord
            </strong>
          </div>

          <div className="topbar-right">
            <div className="environment">
              <span className="status-dot" />
              Environnement de test
            </div>

            
          </div>
        </header>

        <div className="page-content">
          {/* TITRE DE LA PAGE */}
          <section className="welcome-section">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                VOTRE ESPACE DE GESTION
              </div>

              <h1>
                Statistiques mondiales
              </h1>

              <p className="welcome-description">
                Découvrez les chiffres clés renvoyés par l’API de votre machine virtuelle.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={refreshData}
              disabled={loading}
            >
              <span className="refresh-icon">↻</span>
              Actualiser
            </button>
          </section>

          {/* INFORMATIONS SUR LA BASE */}
          <section className="database-banner">
            <div className="database-banner-icon">
              <span>▤</span>
            </div>

            <div className="database-details">
              <span className="database-label">STATISTIQUES DE LA VM</span>

              <h2>Le monde</h2>

              <p>
                <span className="status-dot" />
                API connectée · Flask
              </p>
            </div>

            <div className="database-banner-right">
              <span className="demo-badge">API EN DIRECT</span>

              <span className="last-updated">
                Mise à jour :{" "}
                {lastUpdated.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          </section>

          <section>
              <section className="section-heading">
                <div>
                  <h2>Vue d'ensemble</h2>
                  <p>Les indicateurs renvoyés par le backend Flask</p>
                </div>

                <span className="period-label">APERÇU GLOBAL</span>
              </section>

              {/* CARTES INDICATEURS */}
              <section className="stats-grid">
                <article className="stat-card">
                  <div className="stat-card-top">
                    <div className="stat-icon icon-blue">▤</div>
                    <span className="stat-tag">PAYS</span>
                  </div>

                  <p className="stat-title">Pays recensés</p>
                  <div className="stat-value">
                    {data.totalCountries.toLocaleString("fr-FR")}
                  </div>

                  <p className="stat-description">
                    Dans le monde
                  </p>

                  <div className="stat-bottom blue-bottom" />
                </article>

                <article className="stat-card">
                  <div className="stat-card-top">
                    <div className="stat-icon icon-purple">▦</div>
                    <span className="stat-tag">POPULATION</span>
                  </div>

                  <p className="stat-title">Population totale</p>

                  <div className="stat-value">
                    {data.totalPopulation.toLocaleString("fr-FR")}
                  </div>

                  <p className="stat-description">
                    Habitants estimés
                  </p>

                  <div className="stat-bottom purple-bottom" />
                </article>

                <article className="stat-card">
                  <div className="stat-card-top">
                    <div className="stat-icon icon-teal">▥</div>
                    <span className="stat-tag">CONTINENTS</span>
                  </div>

                  <p className="stat-title">Continents</p>

                  <div className="stat-value">
                    {data.totalContinents.toLocaleString("fr-FR")}
                  </div>

                  <p className="stat-description">
                    Continents recensés
                  </p>

                  <div className="stat-bottom teal-bottom" />
                </article>

                <article className="stat-card">
                  <div className="stat-card-top">
                    <div className="stat-icon icon-orange">⌁</div>
                    <span className="stat-tag">SOURCE</span>
                  </div>

                  <p className="stat-title">Serveur de données</p>
                  <div className="stat-value stat-value-name">VM</div>
                  <p className="stat-description">API Flask en direct</p>
                  <div className="stat-bottom orange-bottom" />
                </article>
              </section>

              <section className="content-grid">
                <article className="panel chart-panel">
                  <div className="panel-header">
                    <div>
                      <h2>Résumé des données</h2>
                      <p>Informations disponibles sur le serveur</p>
                    </div>

                    <span className="panel-icon">▥</span>
                  </div>

                  <div className="chart-list">
                    <div className="chart-row">
                      <div className="chart-row-heading">
                        <span className="chart-table-name">Pays recensés</span>
                        <strong>{data.totalCountries.toLocaleString("fr-FR")}</strong>
                      </div>
                    </div>
                    <div className="chart-row">
                      <div className="chart-row-heading">
                        <span className="chart-table-name">Continents</span>
                        <strong>{data.totalContinents.toLocaleString("fr-FR")}</strong>
                      </div>
                    </div>
                    <div className="chart-row">
                      <div className="chart-row-heading">
                        <span className="chart-table-name">Population</span>
                        <strong>{data.totalPopulation.toLocaleString("fr-FR")}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="chart-footer">
                    <span className="chart-footer-dot" />
                    <span>
                      Données récupérées depuis la machine virtuelle
                    </span>
                  </div>
                </article>

                <article className="panel highlight-panel">
                  <div className="highlight-decoration decoration-one" />
                  <div className="highlight-decoration decoration-two" />

                  <div className="highlight-content">
                    <div className="highlight-icon">✦</div>
                    <span className="highlight-eyebrow">POINT CLÉ</span>

                    <h2>API connectée</h2>

                    <p className="highlight-table-name">
                      http://68.210.184.103:5000
                    </p>

                    <div className="highlight-number">
                      {data.totalContinents}
                      <span> continents</span>
                    </div>

                    <div className="highlight-divider" />

                    <p className="highlight-description">
                      Le backend Flask répond correctement et fournit les statistiques mondiales.
                    </p>
                  </div>
                </article>
              </section>
          </section>

          <footer className="page-footer">
            <span>
              CloudPanel <span className="footer-separator">·</span> TP Cloud
              Computing
            </span>

            <span>Interface React · API Flask</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
