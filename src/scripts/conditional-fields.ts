// Campos condicionais do preset "geral": "Nome da empresa" só aparece (e vira obrigatório)
// quando o tipo de evento escolhido é do grupo corporativo.
import { tiposCorporativos } from './form-presets';

export function initConditionalFields() {
  document.querySelectorAll<HTMLFormElement>('form[data-form-id]').forEach((form) => {
    const tipo = form.querySelector<HTMLSelectElement>('[name="tipo_evento"]');
    const condicionais = form.querySelectorAll<HTMLElement>('[data-show-when="corporativo"]');
    if (!tipo || !condicionais.length) return;

    const atualiza = () => {
      const mostrar = tiposCorporativos.includes(tipo.value);
      condicionais.forEach((campo) => {
        campo.hidden = !mostrar;
        const input = campo.querySelector<HTMLInputElement>('input');
        if (!input) return;
        input.required = mostrar;
        if (!mostrar) input.value = '';
      });
    };
    tipo.addEventListener('change', atualiza);
    atualiza();
  });
}
