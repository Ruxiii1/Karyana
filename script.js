const TEMPLATE_PATH = 'template-source/hbd';
const ASSET_FILES = ['capibaya-wave.png', 'capibaya-party.png', 'capibaya-jump.png', 'capibaya-sit.png'];

const galleryView = document.getElementById('view-gallery');
const editorView = document.getElementById('view-editor');
const previewFrame = document.getElementById('preview-frame');

const inputNama = document.getElementById('input-nama');
const inputTanggal = document.getElementById('input-tanggal');
const inputPesan = document.getElementById('input-pesan');
const btnGenerate = document.getElementById('btn-generate');
const btnBack = document.getElementById('btn-back');

let cachedFiles = null; // { 'index.html': text, 'style.css': text, 'script.js': text }

function formatTanggal(isoDate) {
  if (!isoDate) return 'Tanggal spesialmu';
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d} ${bulan[m - 1]} ${y}`;
}

function currentValues() {
  return {
    nama: inputNama.value.trim() || 'Kamu',
    tanggal: formatTanggal(inputTanggal.value),
    pesan: inputPesan.value.trim() || 'Semoga hari-harimu selalu dipenuhi hal baik dan kebahagiaan kecil yang bikin senyum.',
  };
}

function applyTemplate(htmlText, values) {
  return htmlText
    .replaceAll('{{NAMA}}', values.nama)
    .replaceAll('{{TANGGAL}}', values.tanggal)
    .replaceAll('{{PESAN}}', values.pesan);
}

async function loadTemplateFiles() {
  if (cachedFiles) return cachedFiles;
  const [html, css, js] = await Promise.all([
    fetch(`${TEMPLATE_PATH}/index.html`).then(r => r.text()),
    fetch(`${TEMPLATE_PATH}/style.css`).then(r => r.text()),
    fetch(`${TEMPLATE_PATH}/script.js`).then(r => r.text()),
  ]);
  cachedFiles = { html, css, js };
  return cachedFiles;
}

async function updatePreview() {
  const files = await loadTemplateFiles();
  const values = currentValues();
  const html = applyTemplate(files.html, values)
    .replace('href="style.css"', `href="data:text/css;base64,${btoa(unescape(encodeURIComponent(files.css)))}"`)
    .replace('src="script.js"', `src="data:text/javascript;base64,${btoa(unescape(encodeURIComponent(files.js)))}"`)
    .replaceAll('src="assets/', `src="${TEMPLATE_PATH}/assets/`);
  previewFrame.srcdoc = html;
}

function openEditor() {
  galleryView.classList.remove('active');
  editorView.classList.add('active');
  updatePreview();
}

function backToGallery() {
  editorView.classList.remove('active');
  galleryView.classList.add('active');
}

document.querySelectorAll('[data-open]').forEach(btn => {
  btn.addEventListener('click', openEditor);
});
btnBack.addEventListener('click', backToGallery);

[inputNama, inputTanggal, inputPesan].forEach(el => {
  el.addEventListener('input', updatePreview);
});

async function generateZip() {
  btnGenerate.disabled = true;
  btnGenerate.textContent = 'Menyiapkan file...';

  try {
    const files = await loadTemplateFiles();
    const values = currentValues();
    const zip = new JSZip();

    zip.file('index.html', applyTemplate(files.html, values));
    zip.file('style.css', files.css);
    zip.file('script.js', files.js);

    const assetsFolder = zip.folder('assets');
    for (const filename of ASSET_FILES) {
      const blob = await fetch(`${TEMPLATE_PATH}/assets/${filename}`).then(r => r.blob());
      assetsFolder.file(filename, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    const safeName = values.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'ucapan';
    a.href = url;
    a.download = `karyana-ucapan-${safeName}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Gagal bikin file, coba lagi ya. (' + err.message + ')');
  } finally {
    btnGenerate.disabled = false;
    btnGenerate.textContent = 'Download file (.zip)';
  }
}

btnGenerate.addEventListener('click', generateZip);
