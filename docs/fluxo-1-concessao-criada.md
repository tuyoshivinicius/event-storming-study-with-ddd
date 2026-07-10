# Event Storming — Fluxo 1 · Concessão de Acesso Criada (principal)

> **Convenções:** cores/formas canônicas de Event Storming (evento laranja, comando azul, política roxa, agregado amarelo, sistema externo verde, read model verde-claro, ator amarelo-claro). Os nós compartilhados entre os três fluxos usam IDs idênticos — ao concatenar os blocos num único `flowchart LR`, os pontos comuns se fundem automaticamente.

```mermaid
---
config:
  layout: dagre
---
flowchart LR
    ExternalSystemGestaoDeAcessos(("Gestão de Acessos (Matrix)")) --> DomainEventConcessaoDeAcessoCriada(["Concessão de Acesso Criada"])
    CommandObterClassificacaoDePrivacidadeDaTabela["Obter Classificação de Privacidade da Tabela"] -. consulta .-> ExternalSystemProtecaoDeDados(("Proteção de Dados (Motor de Proteção)"))
    CommandObterClassificacaoDePrivacidadeDaTabela --> DomainEventClassificacaoDePrivacidadeDaTabelaObtida(["Classificação de Privacidade da Tabela Obtida"])
    DomainEventClassificacaoDePrivacidadeDaTabelaObtida --> PolicyAvaliarNecessidadeDeRegistroDeTratamento>"Avaliar Necessidade de Registro de Tratamento"]
    DomainEventConcessaoDeAcessoCriada --> PolicyPropagarConcessaoDeAcessoParaPrivacidade>"Propagar Concessão de Acesso para Privacidade"]
    PolicyPropagarConcessaoDeAcessoParaPrivacidade --> DomainEventConcessaoDeAcessoRecebida(["Concessão de Acesso Recebida"])
    DomainEventConcessaoDeAcessoRecebida --> CommandObterClassificacaoDePrivacidadeDaTabela
    PolicyAvaliarNecessidadeDeRegistroDeTratamento --> CommandRegistrarAvaliacaoDaConcessao["Registrar Avaliação da Concessão"]
    CommandRegistrarAvaliacaoDaConcessao --> AggreagateRegistroDeAvaliacaoDaConcessao["Registro de Avaliação da Concessão"]
    AggreagateRegistroDeAvaliacaoDaConcessao --> DomainEventConcessaoAvaliada(["Concessão Avaliada - resultado: classificação de privaciade com dado pessoal, sem dado pessoal ou não classificada; origem: solicitação de acesso ou reclassificação motor<br>"])
    DomainEventConcessaoAvaliada -- com dado pessoal --> PolicyAtribuirConcessaoAAtividadeDeTratamento>"Atribuir Concessão à Atividade de Tratamento"]
    DomainEventConcessaoAvaliada -- evidência (todos os desfechos) --> ReadModelTrilhaDeEvidencias(["Trilha de Evidências DataMesh"])
    PolicyAtribuirConcessaoAAtividadeDeTratamento -. consulta .-> ReadModelIndiceDeAtividadesDeTratamento["Índice de Atividades de Tratamento"]
    PolicyAtribuirConcessaoAAtividadeDeTratamento -- atividade inexistente --> CommandRegistrarAtividadeDeTratamento["Registrar Atividade de Tratamento"]
    PolicyAtribuirConcessaoAAtividadeDeTratamento -- atividade existente --> CommandIncluirTabelaNaAtividadeDeTratamento["Incluir Tabela na Atividade de Tratamento"]
    CommandRegistrarAtividadeDeTratamento --> AggreagateAtividadeDeTratamento["Atividade de Tratamento"]
    CommandRegistrarAtividadeDeTratamento -- consulta diretoria, comunidade e time responsavel --> ExternalSystemEstruturaOrganizacional(("Estrutura Organizacional (ServiceNow)"))
    CommandRegistrarAtividadeDeTratamento -- consulta solicitação, beneficiario e curador da Concessão --> ExternalSystemGestaoDeAcessos
    CommandIncluirTabelaNaAtividadeDeTratamento --> AggreagateAtividadeDeTratamento
    AggreagateAtividadeDeTratamento --> DomainEventAtividadeDeTratamentoRegistrada(["Atividade de Tratamento Registrada"]) & DomainEventTabelaIncluidaAAtividadeDeTratamento(["Tabela Incluída à Atividade de Tratamento"])
    DomainEventAtividadeDeTratamentoRegistrada --> PolicySincronizarAtividadeNoRoPA>"Sincronizar Atividade no RoPA"]
    DomainEventTabelaIncluidaAAtividadeDeTratamento --> PolicySincronizarAtividadeNoRoPA
    PolicySincronizarAtividadeNoRoPA --> CommandAtualizarEscopoDaAtividadeDeTratamentoNoOneTrust["Atualizar Escopo da Atividade de Tratamento no OneTrust"]
    CommandAtualizarEscopoDaAtividadeDeTratamentoNoOneTrust --> DomainEventEscopoDaAtividadeRefletidoNoRoPA(["Escopo da Atividade Refletido no RoPA"])
    CommandAtualizarEscopoDaAtividadeDeTratamentoNoOneTrust -. via .-> ExternalSystemRopa(("RoPA (OneTrust)"))
    DomainEventEscopoDaAtividadeRefletidoNoRoPA --> ReadModelAtividadeDeTratamentoOneTrustRoPA(["Atividade de Tratamento OneTrust RoPA"]) & CommandObterBaseLegalDaAtividadeDeTratamento(["Obter Base Legal da Atividade de Tratamento"])
    CommandObterBaseLegalDaAtividadeDeTratamento -. consulta base legal com nível de confiança .-> ExternalSystemDeterminacaoDeBaseLegal(("Determinação de Base Legal (Elda)"))
    CommandObterBaseLegalDaAtividadeDeTratamento --> DomainEventBaseLegalDaAtividadeObtida(["Base Legal da Atividade Obtida"])
    DomainEventBaseLegalDaAtividadeObtida --> PolicyAvaliarNecessidadeDeRevisaoDaBaseLegal>"Avaliar Necessidade de Revisão da Base Legal"]
    PolicyAvaliarNecessidadeDeRevisaoDaBaseLegal --> CommandRegistrarAvaliacaoDeBaseLegal["Registrar Avaliação de Base Legal"] & ReadModelListaFixaCategoriasDeDadoCriticas["Lista fixa Categorias de Dado Críticas"]
    CommandRegistrarAvaliacaoDeBaseLegal --> AggreagateRegistroDeAvaliacaoDeBaseLegal["Registro de Avaliação de Base Legal"]
    AggreagateRegistroDeAvaliacaoDeBaseLegal --> DomainEventBaseLegalDaAtividadeAvaliada(["Base Legal da Atividade Avaliada"])
    DomainEventBaseLegalDaAtividadeAvaliada -- evidência --> ReadModelTrilhaDeEvidencias
    DomainEventBaseLegalDaAtividadeAvaliada -- alta confiança e sem categorias críticas --> CommandConcluirAtividadeComBaseLegalNoOneTrust["Concluir Atividade com Base Legal no OneTrust"]
    DomainEventBaseLegalDaAtividadeAvaliada -- baixa confiança ou categorias críticas --> CommandEncaminharAtividadeParaRevisaoDePEDNoOneTrust["Encaminhar Atividade para Revisão de PED no OneTrust"]
    CommandConcluirAtividadeComBaseLegalNoOneTrust --> DomainEventAtividadeDeTratamentoConcluida(["Atividade de Tratamento Concluída"])
    CommandConcluirAtividadeComBaseLegalNoOneTrust -. via .-> ExternalSystemRopa
    CommandEncaminharAtividadeParaRevisaoDePEDNoOneTrust --> DomainEventAtividadeDeTratamentoEncaminhadaParaRevisao(["Atividade de Tratamento Encaminhada para Revisão"])
    CommandEncaminharAtividadeParaRevisaoDePEDNoOneTrust -. via .-> ExternalSystemRopa
    DomainEventAtividadeDeTratamentoConcluida --> ReadModelAtividadeDeTratamentoOneTrustRoPA
    DomainEventAtividadeDeTratamentoEncaminhadaParaRevisao --> ReadModelFilaDeRevisaoDePEDOneTrust(["Fila de Revisão de PED OneTrust"])
    ReadModelFilaDeRevisaoDePEDOneTrust --> ActorAnalistaDePrivacidadePED(("Analista de Privacidade PED"))
    ReadModelAtividadeDeTratamentoOneTrustRoPA --> ActorAnalistaDePrivacidadePED
    ReadModelTrilhaDeEvidencias --> ActorEncarregadoDPO(("Encarregado DPO"))
    DomainEventConcessaoAvaliada --> n1["Registro de Avaliação de Concessão - modelo: grupo, tabela, finalidade, origem (matrix ou motor), classificação de privacidade, categorias de dado, classificado pelo motor ou curador, id versão da classificação, id evento de classificação<br>"]

    n1@{ shape: doc}
     ExternalSystemGestaoDeAcessos:::ExternalSystem
     DomainEventConcessaoDeAcessoCriada:::DomainEvent
     CommandObterClassificacaoDePrivacidadeDaTabela:::Command
     ExternalSystemProtecaoDeDados:::ExternalSystem
     DomainEventClassificacaoDePrivacidadeDaTabelaObtida:::DomainEvent
     PolicyAvaliarNecessidadeDeRegistroDeTratamento:::Policy
     PolicyPropagarConcessaoDeAcessoParaPrivacidade:::Policy
     DomainEventConcessaoDeAcessoRecebida:::DomainEvent
     CommandRegistrarAvaliacaoDaConcessao:::Command
     AggreagateRegistroDeAvaliacaoDaConcessao:::Aggreagate
     DomainEventConcessaoAvaliada:::DomainEvent
     PolicyAtribuirConcessaoAAtividadeDeTratamento:::Policy
     ReadModelTrilhaDeEvidencias:::ReadModel
     ReadModelIndiceDeAtividadesDeTratamento:::ReadModel
     CommandRegistrarAtividadeDeTratamento:::Command
     CommandIncluirTabelaNaAtividadeDeTratamento:::Command
     AggreagateAtividadeDeTratamento:::Aggreagate
     ExternalSystemEstruturaOrganizacional:::ExternalSystem
     DomainEventAtividadeDeTratamentoRegistrada:::DomainEvent
     DomainEventTabelaIncluidaAAtividadeDeTratamento:::DomainEvent
     PolicySincronizarAtividadeNoRoPA:::Policy
     CommandAtualizarEscopoDaAtividadeDeTratamentoNoOneTrust:::Command
     DomainEventEscopoDaAtividadeRefletidoNoRoPA:::DomainEvent
     ExternalSystemRopa:::ExternalSystem
     ReadModelAtividadeDeTratamentoOneTrustRoPA:::ReadModel
     CommandObterBaseLegalDaAtividadeDeTratamento:::Command
     ExternalSystemDeterminacaoDeBaseLegal:::ExternalSystem
     DomainEventBaseLegalDaAtividadeObtida:::DomainEvent
     PolicyAvaliarNecessidadeDeRevisaoDaBaseLegal:::Policy
     CommandRegistrarAvaliacaoDeBaseLegal:::Command
     ReadModelListaFixaCategoriasDeDadoCriticas:::ReadModel
     AggreagateRegistroDeAvaliacaoDeBaseLegal:::Aggreagate
     DomainEventBaseLegalDaAtividadeAvaliada:::DomainEvent
     CommandConcluirAtividadeComBaseLegalNoOneTrust:::Command
     CommandEncaminharAtividadeParaRevisaoDePEDNoOneTrust:::Command
     DomainEventAtividadeDeTratamentoConcluida:::DomainEvent
     DomainEventAtividadeDeTratamentoEncaminhadaParaRevisao:::DomainEvent
     ReadModelFilaDeRevisaoDePEDOneTrust:::ReadModel
     ActorAnalistaDePrivacidadePED:::Actor
     ActorEncarregadoDPO:::Actor
     n1:::ReadModel
    classDef Policy fill:#E1BEE7
    classDef Aggreagate fill:#FFD600
    classDef Command fill:#BBDEFB
    classDef DomainEvent fill:#FF6D00
    classDef ExternalSystem fill:#00C853
    classDef Actor fill:#FFF9C4
    classDef ReadModel fill:#C8E6C9
```
