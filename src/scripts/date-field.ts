// Calendário padrão Dmove para os campos de data dos formulários da página:
// Flatpickr pt-BR, minDate hoje, máscara dd/mm/aaaa (mesma config do popup de WhatsApp).
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import 'flatpickr/dist/flatpickr.min.css';

export function initDateFields() {
  document.querySelectorAll<HTMLInputElement>('form[data-form-id] [data-datepicker]').forEach((el) => {
    if (el.dataset.flatpickrReady) return;
    el.dataset.flatpickrReady = 'true';

    // máscara dd/mm/aaaa enquanto digita (o flatpickr interpreta ao sair do campo)
    el.addEventListener('input', () => {
      const d = el.value.replace(/\D/g, '').slice(0, 8);
      el.value = d.length > 4 ? `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}` : d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
    });

    flatpickr(el, {
      locale: Portuguese,
      dateFormat: 'd/m/Y',
      minDate: 'today',
      allowInput: true,
      disableMobile: false, // no celular usa o seletor nativo; o flatpickr mantém o valor em d/m/Y
    });
  });
}
