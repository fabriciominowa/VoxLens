# Guia de Acessibilidade: Formulário de Contato

Este guia descreve os requisitos e as melhores práticas para implementar um formulário de contato acessível no seu portfólio Angular.

## 0. Transparência e Uso Acadêmico (Ética)
Antes de coletar qualquer dado, é fundamental informar ao usuário a finalidade do formulário. Este projeto é parte integrante da pesquisa: **"Acessibilidade Adaptativa em Angular: IA e Web Speech para Deficiências Visuais, Auditivas e Neurológicas"**.

*   **Texto Sugerido:** "Este formulário faz parte do projeto de pesquisa 'Acessibilidade Adaptativa em Angular: IA e Web Speech para Deficiências Visuais, Auditivas e Neurológicas'. Os dados coletados serão utilizados exclusivamente para fins de estudo acadêmico, visando melhorar a inclusão digital, e não serão compartilhados comercialmente."
*   **Acessibilidade do Aviso:**
    *   Coloque o texto logo abaixo do título do formulário.
    *   Use uma tag `<p>` com um ID (ex: `id="academic-notice"`).
    *   No elemento `<form>`, utilize `aria-describedby="academic-notice"` para que o leitor de tela anuncie a finalidade e o título da pesquisa assim que o usuário entrar no formulário.

## 1. Estrutura Semântica
*   **Use `<form>`:** Sempre envolva seus campos em uma tag de formulário.
*   **Labels Explícitas:** Cada `<input>`, `<textarea>` ou `<select>` deve ter um `<label>` associado via atributo `for` (ou `[for]` no Angular) correspondente ao `id` do input.
*   **Fieldsets e Legends:** Se houver grupos de campos (ex: seleção de serviços), use `<fieldset>` com um `<legend>` para descrever o grupo.

## 2. Atributos ARIA Essenciais
*   `aria-required="true"`: Para campos obrigatórios.
*   `aria-invalid="true"`: Ativado dinamicamente quando o campo contiver erro.
*   `aria-describedby`: Para associar mensagens de erro ou textos de ajuda ao input.
*   `aria-live="polite"`: Em containers de erro para que o leitor de tela anuncie a falha assim que ela aparecer.

## 3. Navegação e Foco
*   **Ordem Tabular:** Garanta que a tecla `Tab` siga a ordem visual lógica.
*   **Indicador de Foco:** Nunca remova o `outline` do CSS sem fornecer uma alternativa visual clara.
*   **Foco no Erro:** Ao tentar enviar um formulário com erro, o foco deve ser movido para o primeiro campo inválido.

## 4. Validação e Feedback
*   **Mensagens Claras:** Evite apenas cores (ex: borda vermelha). Use texto para indicar o erro.
*   **Tempo:** Não coloque limites de tempo para preenchimento.
*   **Confirmação:** Após o envio bem-sucedido, anuncie o status ("Mensagem enviada com sucesso") usando um `aria-live`.

---

## Exemplo de Implementação (Angular + Reactive Forms)

### HTML (`contact.component.html`)
```html
<!-- O título da pesquisa serve como contexto inicial -->
<h2 id="form-title">{{ i18n.t('contact.title') }}</h2>

<!-- Aviso Acadêmico: Importante para ética e transparência -->
<p id="academic-notice" class="academic-info">
  Este formulário faz parte do projeto de pesquisa 
  <strong>"Acessibilidade Adaptativa em Angular: IA e Web Speech para Deficiências Visuais, Auditivas e Neurológicas"</strong>. 
  Os dados são para fins estritamente acadêmicos.
</p>

<!-- O formulário usa aria-describedby para apontar para o aviso acadêmico -->
<form [formGroup]="contactForm" (ngSubmit)="onSubmit()" aria-describedby="academic-notice">
  <div class="form-group">
    <label for="name">{{ i18n.t('contact.form.name') }}</label>
    <input 
      id="name" 
      type="text" 
      formControlName="name"
      [attr.aria-invalid]="contactForm.get('name')?.invalid && contactForm.get('name')?.touched"
      aria-describedby="name-error"
    >
    <div 
      id="name-error" 
      class="error-message" 
      *ngIf="contactForm.get('name')?.invalid && contactForm.get('name')?.touched"
      aria-live="polite"
    >
      {{ i18n.t('contact.form.errors.nameRequired') }}
    </div>
  </div>

  <button type="submit" [disabled]="contactForm.pending">
    {{ i18n.t('contact.form.submit') }}
  </button>
</form>
```

### CSS (`contact.component.scss`)
```scss
.academic-info {
  background-color: #f8f9fa;
  border-left: 4px solid var(--accent);
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #555;
}

.form-group {
// ... restante do estilo
```

## 5. Checklist de Teste Preliminar
1. [ ] Consigo preencher e enviar o formulário usando apenas o teclado?
2. [ ] O leitor de tela lê o label corretamente ao focar no input?
3. [ ] As mensagens de erro são anunciadas pelo leitor de tela?
4. [ ] O contraste das cores do texto e bordas atende ao nível AA (mínimo 4.5:1)?
5. [ ] O botão de envio tem um estado visual claro de "carregando" ou "desabilitado"?

---

## 📋 Pesquisa com Usuários: Feedback e Inovação (10 Perguntas)

Use este roteiro para coletar dados qualitativos e entender como diferentes pessoas percebem a acessibilidade e o uso de IA no seu projeto.

### Experiência de Navegação e Uso
1.  **Facilidade:** De 1 a 5, quão intuitivo foi navegar pelo site e encontrar o que precisava? Alguma parte pareceu confusa?
2.  **Instruções e Feedback:** Você sentiu falta de alguma instrução ou resposta do sistema (visual, sonora ou tátil) enquanto preenchia o formulário ou clicava nos botões?
3.  **Conforto na Leitura:** Como você avalia o tamanho dos textos e o contraste das cores? Foi confortável realizar a leitura de todas as informações?
4.  **Navegação Alternativa:** Se você utiliza apenas o teclado ou leitor de tela, a ordem em que os elementos foram anunciados fez sentido para você?
5.  **Clareza de Conteúdo:** O conteúdo escrito no site é claro e direto, ou você encontrou termos técnicos e frases difíceis de compreender?

### Percepção e Valor
6.  **Recursos de Acessibilidade:** Você notou recursos específicos de acessibilidade no site (como ajustes de contraste, fontes ou labels)? De que forma isso impactou sua experiência?
7.  **Barreiras Digitais:** Qual é a maior dificuldade que você costuma encontrar na internet hoje (ex: botões pequenos, cores sem contraste, falta de descrições)?
8.  **Inclusividade:** Na sua percepção, este site demonstra ter sido projetado pensando na diversidade de usuários? O que o tornaria ainda mais acolhedor?

### Futuro e Inteligência Artificial
9.  **Impacto da IA (Pergunta Bônus):** Na sua opinião, em qual destes aspectos da acessibilidade digital a Inteligência Artificial teria o maior impacto positivo nos próximos anos?
    *   ( ) **A) Imagens:** IA descrevendo fotos e gráficos detalhadamente.
    *   ( ) **B) Comunicação:** IA traduzindo textos/áudios para Libras de forma fluida.
    *   ( ) **C) Compreensão:** IA simplificando textos complexos para linguagem clara.
    *   ( ) **D) Navegação:** IA permitindo controlar toda a interface por voz inteligente.
    *   ( ) **E) Correção:** IA corrigindo falhas de código dos desenvolvedores em tempo real.
10. **Conserto via IA:** Se uma IA pudesse "consertar" automaticamente um problema técnico que você enfrenta diariamente na web, qual seria sua primeira prioridade?


