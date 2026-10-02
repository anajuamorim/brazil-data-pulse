# Brazil Data Pulse

Dashboard interativo de indicadores econômicos com dados públicos consultados diretamente da API do Banco Mundial.

## O projeto

O painel permite explorar séries históricas brasileiras e comparar o crescimento do PIB com economias selecionadas da América Latina.

- Indicadores: crescimento anual do PIB, inflação ao consumidor, desemprego e população.
- Filtros por ano inicial e final.
- Gráficos interativos com Chart.js.
- Leituras descritivas calculadas a partir do período selecionado.
- Layout responsivo para desktop e dispositivos móveis.

## Tecnologias

- HTML5 e CSS3
- JavaScript (ES6+)
- Chart.js
- World Bank Indicators API
- GitHub Pages

## Fonte dos dados

Os indicadores são consultados dinamicamente na [World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api), utilizando séries do conjunto World Development Indicators.

| Indicador | Código |
|---|---|
| Crescimento do PIB (anual %) | `NY.GDP.MKTP.KD.ZG` |
| Inflação ao consumidor (anual %) | `FP.CPI.TOTL.ZG` |
| Desemprego, estimativa modelada (%) | `SL.UEM.TOTL.ZS` |
| População total | `SP.POP.TOTL` |

A disponibilidade e o ano mais recente variam por indicador e país. Os valores ausentes são tratados como indisponíveis, não como zero. As leituras automáticas são descritivas e não demonstram causalidade.

## Executar localmente

Como o painel usa `fetch`, abra-o por um servidor local em vez de depender do acesso direto ao arquivo:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`.

## Publicação

O projeto está preparado para GitHub Pages: os arquivos estáticos ficam na raiz do repositório e não precisam de servidor próprio. Em **Settings → Pages**, selecione **Deploy from a branch**, branch `main` e pasta `/(root)`.

## Próximas melhorias

- Adicionar testes de qualidade para as respostas da API.
- Incluir definições metodológicas mais detalhadas por indicador.
- Ampliar a comparação para outros indicadores e países.
- Investigar relações entre séries sem confundir correlação com causalidade.

---
Projeto educacional de portfólio em análise de dados.