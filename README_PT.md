<div align="center">
  <img src="frontend/src/assets/logo.png" alt="Go-DLP Logo" width="200" height="200" />

  # Go-DLP

  [![License](https://img.shields.io/github/license/Locon213/Go-DLP)](LICENSE)
  [![Go Version](https://img.shields.io/github/go-mod/go-version/Locon213/Go-DLP)](go.mod)
  [![Stars](https://img.shields.io/github/stars/Locon213/Go-DLP.svg)](https://github.com/Locon213/Go-DLP/stargazers)
  [![Downloads](https://img.shields.io/github/downloads/Locon213/Go-DLP/total.svg)](https://github.com/Locon213/Go-DLP/releases)

  **Cliente de Desktop yt-dlp Moderno**

  Um aplicativo de desktop poderoso e multiplataforma para baixar vídeos do YouTube, Vimeo, TikTok, Instagram, Twitter, SoundCloud e mais de 1000 outras plataformas.

  [🌐 Site](https://github.com/Locon213/Go-DLP) • [📖 Documentação](#documentação) • [🐛 Problemas](https://github.com/Locon213/Go-DLP/issues) • [❤️ Patrocinar](#doar)

</div>

---

## 🌍 Seleção de Idioma | Language Selection | 选择语言

<div align="center">

| 🇺🇸 English | 🇷🇺 Русский | 🇨🇳 中文 | 🇪🇸 Español | 🇫🇷 Français |
|:---:|:---:|:---:|:---:|:---:|
| [README.md](README.md) | [README_RU.md](README_RU.md) | [README_ZH.md](README_ZH.md) | [README_ES.md](README_ES.md) | [README_FR.md](README_FR.md) |

| 🇩🇪 Deutsch | 🇵🇹 Português | 🇯🇵 日本語 | 🇰🇷 한국어 | 🇸🇦 العربية |
|:---:|:---:|:---:|:---:|:---:|
| [README_DE.md](README_DE.md) | **README_PT.md** | [README_JA.md](README_JA.md) | [README_KO.md](README_KO.md) | [README_AR.md](README_AR.md) |

</div>

---

## 🌟 Recursos

- ⚡ **Rápido como um Raio**: Otimizado para velocidade e eficiência
- 🔐 **Seguro e Privado**: Sem servidores externos envolvidos
- 🎥 **Alta Qualidade**: Mantém a qualidade original
- 🌍 **Suporte Multilingue**: Disponível em 10 idiomas
- 💻 **Multiplataforma**: Funciona no Windows, macOS e Linux
- 🎨 **Interface Moderna**: Interface bonita e intuitiva
- 📁 **Seleção de Formato**: Escolha entre vários formatos de vídeo/áudio
- 🔄 **Conversor Integrado**: Converte vídeos para diferentes formatos
- 🛡️ **Suporte a Proxy**: Configure definições de proxy para redes restritas
- 🍪 **Suporte a Cookies**: Extraia cookies de navegadores ou use arquivos de cookies personalizados

## 📋 Requisitos

- Windows 7 ou superior, macOS 10.12 ou superior, ou Linux
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) instalado e acessível no PATH
- Conexão com a Internet para baixar vídeos

## 🚀 Instalação

### Binários Pré-compilados

1. Baixe a versão mais recente da [página de Releases](https://github.com/Locon213/Go-DLP/releases)
2. Extraia o arquivo
3. Execute o arquivo executável

### Compilando do Código Fonte

1. Instale [Go](https://golang.org/) (versão 1.25.5 ou superior)
2. Instale [Node.js](https://nodejs.org/) (para compilação do frontend)
3. Clone o repositório:
   ```bash
   git clone https://github.com/Locon213/Go-DLP.git
   cd Go-DLP
   ```
4. Instale as dependências:
   ```bash
   go mod tidy
   cd frontend && npm install
   ```
5. Compile o aplicativo:
   ```bash
   go build -o go-dlp .
   ```
6. Execute o aplicativo:
   ```bash
   ./go-dlp
   ```

## 📖 Documentação

### Uso Básico

1. Inicie o aplicativo Go-DLP
2. Digite a URL do vídeo que você quer baixar
3. Clique em "Analisar e Baixar" para buscar os formatos disponíveis
4. Selecione seu formato e qualidade preferidos
5. Escolha o local de download
6. Aguarde a conclusão do download

### Recursos Avançados

#### Seleção de Formato
- Navegue por todos os formatos disponíveis para o vídeo
- Filtre por resolução, tamanho do arquivo e qualidade
- Pré-visualize os detalhes do formato antes de baixar

#### Conversor Integrado
- Converta vídeos baixados para diferentes formatos
- Suporta formatos comuns de vídeo e áudio
- Capacidades de conversão em lote

#### Configuração de Proxy
- Configure as definições de proxy do sistema
- Configure o proxy manualmente
- Ignore o proxy para domínios específicos

#### Suporte a Cookies
- Extraia cookies do seu navegador
- Importe arquivos de cookies personalizados
- Lide com conteúdo com restrição de idade

## 🤝 Contribuições

Aceitamos contribuições de todos! Veja como você pode ajudar:

1. Fork o repositório
2. Crie um branch de recurso (`git checkout -b feature/amazing-feature`)
3. Commite suas alterações (`git commit -m 'Add amazing feature'`)
4. Push para o branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

### Guia de Tradução

Para contribuir com traduções:

1. Localize os arquivos de tradução em `frontend/src/i18n/translations.ts`
2. Adicione suas traduções seguindo a estrutura existente
3. Atualize o array `supportedLanguages` com seu idioma
4. Submeta um pull request com suas alterações

## 📄 Licença

Este projeto está licenciado sob a GNU General Public License v3.0 (GPLv3) - veja o arquivo [LICENSE](LICENSE).

### Pontos-Chave da GPL v3:

- Você pode executar, estudar, compartilhar e modificar o software livremente
- Você pode distribuir versões modificadas sob a mesma licença
- Você deve divulgar o código fonte de suas modificações
- Você deve licenciar suas modificações sob os mesmos termos
- O software vem sem garantia

## 🙏 Agradecimentos

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - A tecnologia principal por trás do Go-DLP
- [Wails](https://wails.io/) - Framework para criar aplicativos de desktop com Go e tecnologias web
- [Comunidade yt-dlp](https://github.com/yt-dlp/yt-dlp) - Por manter o mecanismo de download subjacente
- Todos os contribuidores que ajudaram a traduzir e melhorar o Go-DLP

## ❤️ Doar

Se você achou o Go-DLP útil, considere apoiar o projeto:

- Bitcoin (BTC): `bc1qgwur4cgs3hpzl7quc4p0yrvjw50326sxkdxldv`
- Ethereum (ERC20): `0x9aa8eB123f24B917a0955C37DeBCb2Ee7281e51d`
- TON (TON): `UQDh1PIoVthF_SRFd6x2sRNkcYRDCJ_cbi7SkAqxDBN7AAMV`
- Tether (USDT,TRC20): `TCoeX2c5L2yyeiEZ3oK2nnjpgmSxgnr9N2`

## 🐛 Relatando Problemas

Se você encontrar qualquer problema, por favor [abra uma issue](https://github.com/Locon213/Go-DLP/issues) com:

- Descrição detalhada do problema
- Passos para reproduzir
- Comportamento esperado
- Comportamento atual
- Capturas de tela se aplicável
- Seu sistema operacional e versão do Go-DLP

## 🆘 Suporte

Para ajuda adicional:

- Pesquise as [issues](https://github.com/Locon213/Go-DLP/issues) existentes
- Junte-se às nossas [Discussões](https://github.com/Locon213/Go-DLP/discussions)

---

<div align="center">
  <sub>Criado com ❤️ por <a href="https://github.com/Locon213">Locon213</a></sub>
</div>
