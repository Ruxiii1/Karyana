document.addEventListener('DOMContentLoaded', () => {
  const envelope = document.getElementById('envelope');
  const scenes = Array.from(document.querySelectorAll('.scene'));

  function goToScene(n) {
    scenes.forEach(s => s.classList.remove('active'));
    const target = scenes.find(s => s.dataset.scene === String(n));
    if (target) target.classList.add('active');
  }

  envelope.addEventListener('click', () => {
    envelope.classList.add('open');
    setTimeout(() => goToScene(2), 550);
  });

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = Number(btn.closest('.scene').dataset.scene);
      goToScene(current + 1);
    });
  });
});
