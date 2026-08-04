# 🗄️ Tutorial de Banco de Dados — UNIVESP

> Material didático interativo de Banco de Dados para a UNIVESP: conteúdo semanal, quizzes e questões de fixação.

## 📌 Sobre

Site educativo que reúne o conteúdo de **Banco de Dados** da UNIVESP em formato interativo — com aulas semanais, exemplos visuais (MER, SQL, normalização, ACID) e quizzes para testar o conhecimento.

## 📚 Conteúdo

| Semana | Tema |
|---|---|
| Semana 1 | Conceitos iniciais, entidades, atributos, chaves e cardinalidade (MER) |
| Semana 2 | Relacionamentos e modelagem conceitual |
| Semana 3 | SQL — DDL e DML |
| Semana 4 | Consultas, agregações e operações relacionais |
| ... | Normalização, propriedades ACID e mais |

Cada semana tem páginas dedicadas em `docs/` com imagens didáticas (`docs/assets/images/semana*`).

## ✨ Funcionalidades

- ✅ Conteúdo organizado por semanas (`docs/week.html`)
- ✅ **Quizzes interativos** com engine própria (`docs/quiz.html`)
- ✅ **Syllabus** completo da disciplina (`docs/syllabus.html`)
- ✅ Dados centralizados em JSON (`docs/data/`) — fácil de atualizar
- ✅ Totalmente estático — roda em qualquer servidor web

## 🎮 Pasta `stitch/`

A pasta `stitch/` contém protótipos de **jogos educativos de História para o ENEM** (código + capturas de tela) que foram parar neste repositório — provavelmente movidos por engano de outro projeto. Enquanto permanecem aqui, servem de referência visual para os jogos do site.

## 🚀 Como executar localmente

```bash
git clone https://github.com/Alexsantossp71/tutorial-bd-univesp.git
cd tutorial-bd-univesp

# Servidor local
python -m http.server 8000
# acesse http://localhost:8000/docs/
```

## 🛠️ Tecnologias

- HTML5, CSS3 e JavaScript (vanilla, sem dependências)
- Dados em JSON (`docs/data/`)

## 👤 Autor

**Alexandre Ramos** — [github.com/Alexsantossp71](https://github.com/Alexsantossp71)

## 📄 Status

Material de estudo publicado (última atualização: fevereiro/2026).
