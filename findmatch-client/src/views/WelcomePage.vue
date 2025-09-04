<template>
  <div class="fm-landing">
    <!-- Hero -->
    <header class="fm-landing-hero text-white">
      <div class="container py-5">
        <div class="text-center mb-4">
          <img src="/images/logo.png" alt="FindMatch" class="fm-landing-logo" />
          <h1 class="visually-hidden">FindMatch</h1>
        </div>

        <p class="lead mb-4 text-center">
          Organizza o unisciti a partite amatoriali di calcio, basket, padel e molto altro.
        </p>

        <div class="fm-cta-group justify-content-center">
          <router-link :to="{ name: 'Login' }" class="btn btn-lg btn-light text-primary fw-semibold">
            Login
          </router-link>
          <router-link :to="{ name: 'Register' }" class="btn btn-lg btn-outline-light">
            Registrazione
          </router-link>
        </div>
      </div>
    </header>

    <!-- Sezione feature -->
    <section class="container py-5">
      <div class="row g-4">
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card h-100 shadow-sm fm-feature-card fm-feature-card--calendars">
            <div class="card-body">
              <h5 class="card-title">📅 Calendario eventi</h5>
              <p class="card-text">Trova partite vicine per data, ora e sport.</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card h-100 shadow-sm fm-feature-card fm-feature-card--sub">
            <div class="card-body">
              <h5 class="card-title">👥 Iscrizioni semplici</h5>
              <p class="card-text">Unisciti con un clic e ricevi promemoria automatici.</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card h-100 shadow-sm fm-feature-card fm-feature-card--connections">
            <div class="card-body">
              <h5 class="card-title">🔗 Segui e trova nuovi amici</h5>
              <p class="card-text">Segui i tuoi amici e trovane di nuovi.</p>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card h-100 shadow-sm fm-feature-card fm-feature-card--rank">
            <div class="card-body">
              <h5 class="card-title">🏅 Sali di lega</h5>
              <p class="card-text">
                Gioca e crea partite per guadagnare punti e scalare le leghe
                <strong>(Lega 4 → Lega 3 → Lega 2 → Lega 1)</strong>. Mostra il tuo livello nel profilo!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="container pb-5">
      <div class="row">
        <div class="col-lg-10 mx-auto">
          <div class="fm-landing-desc fm-feature-card--desc">
            <p>
              Fare sport ha assunto un ruolo sempre più centrale nella vita delle persone, ma organizzare partite è spesso complicato: 
              mancano i numeri, gli orari non coincidono e le chat si perdono. 
              <strong>FindMatch</strong> nasce per semplificare tutto: un’app web per creare o trovare partite amatoriali in pochi minuti.
            </p>
            <ul>
              <li>Crea una partita <strong>scegliendo lo sport </strong>(Calcio a 5/11, Pallavolo, Beach Volley, Basket, Padel, Beach Tennis, Tennis) e imposta <strong>luogo, data, orario e numero di giocatori</strong>.</li>
              <li>Trova <strong>partite disponibili </strong>e unisciti subito, <strong>scegliendo anche il tuo ruolo</strong> nel calcio a 5/11.</li>
            </ul>
            <p class="mb-0">
              L'obiettivo è far incontrare persone con la stessa passione, ridurre le complicazioni organizzative 
              e rendere lo sport più regolare, sociale e accessibile a tutti.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
