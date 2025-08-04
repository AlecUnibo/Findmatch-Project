<template>
  <footer class="bg-light text-dark py-4 border-top mt-auto">
    <div class="container">
      <div class="row">

        <!-- Contatti -->
        <div class="col-md-4 mb-3">
          <h5>Contatti</h5>
          <ul class="list-unstyled">
            <li><a href="mailto:alessandro.cacchi@studio.unibo.it" class="text-decoration-none text-muted">alessandro.cacchi@studio.unibo.it</a></li>
            <li><a href="mailto:luca.zenobi2@studio.unibo.it" class="text-decoration-none text-muted">luca.zenobi2@studio.unibo.it</a></li>
            <li><a href="mailto:stefano.tassinari6@studio.unibo.it" class="text-decoration-none text-muted">stefano.tassinari6@studio.unibo.it</a></li>
          </ul>
        </div>

        <!-- Social -->
        <div class="col-md-4 mb-3">
          <h5>Social</h5>
          <div class="d-flex align-items-center gap-3">
            <a href="https://www.instagram.com/findmatch.it" target="_blank" rel="noopener">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="24" height="24" />
            </a>
            <a href="https://www.linkedin.com/company/google/" target="_blank" rel="noopener">
              <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" width="24" height="24" />
            </a>
          </div>
        </div>

        <!-- Aiuto -->
        <div class="col-md-4 mb-3">
          <h5>Aiuto</h5>
          <ul class="list-unstyled">
            <li><a href="#" class="text-decoration-none text-muted">Servizio clienti</a></li>
            <li><a href="#" class="text-decoration-none text-muted">Pagamenti</a></li>
            <li><a href="#" class="text-decoration-none text-muted">Termini e condizioni</a></li>
            <li><a href="#" class="text-decoration-none text-muted">Privacy</a></li>
          </ul>
        </div>

      </div>

      <hr />

      <div class="text-center text-muted small">
        © 2025 FindMatch – Tutti i diritti riservati
      </div>
    </div>
  </footer>
</template>

<style scoped>
footer img {
  transition: transform 0.2s ease;
}
footer img:hover {
  transform: scale(1.2);
}
</style>
