# Event Storming — Fluxo 2 · Concessão de Acesso Revogada

> **Convenções:** cores/formas canônicas de Event Storming (evento laranja, comando azul, política roxa, agregado amarelo, sistema externo verde, read model verde-claro, ator amarelo-claro). Os nós compartilhados entre os três fluxos usam IDs idênticos — ao concatenar os blocos num único `flowchart LR`, os pontos comuns se fundem automaticamente.

```mermaid
---
config:
  layout: dagre
---
flowchart LR
    ExternalSystemGestaoDeAcessos(("Gestão de Acessos (Matrix)")):::ExternalSystem --> DomainEventConcessaoDeAcessoRevogada(["Concessão de Acesso Revogada"]):::DomainEvent
    DomainEventConcessaoDeAcessoRevogada:::DomainEvent --> PolicyPropagarConcessaoDeAcessoParaPrivacidade>"Propagar Concessão de Acesso para Privacidade"]:::Policy
    PolicyPropagarConcessaoDeAcessoParaPrivacidade:::Policy --> DomainEventRevogacaoDeConcessaoDeAcessoRecebida(["Revogação de Concessão de Acesso Recebida"]):::DomainEvent
    DomainEventRevogacaoDeConcessaoDeAcessoRecebida:::DomainEvent --> PolicyAvaliarImpactoDaRevogacao>"Avaliar Impacto da Revogação"]:::Policy
    PolicyAvaliarImpactoDaRevogacao:::Policy -. consulta .-> ReadModelIndiceDeAtividadesDeTratamento["Índice de Atividades de Tratamento"]:::ReadModel
    PolicyAvaliarImpactoDaRevogacao:::Policy --> CommandRegistrarAvaliacaoDaRevogacao["Registrar Avaliação da Revogação"]:::Command
    CommandRegistrarAvaliacaoDaRevogacao:::Command --> AggreagateRegistroDeAvaliacaoDaRevogacao["Registro de Avaliação da Revogação"]:::Aggreagate
    AggreagateRegistroDeAvaliacaoDaRevogacao:::Aggreagate --> DomainEventRevogacaoAvaliada(["Revogação Avaliada - resultado: vínculo localizado, sem vínculo em atividade ou concessão desconhecida"]):::DomainEvent
    DomainEventRevogacaoAvaliada:::DomainEvent -- evidência (todos os desfechos) --> ReadModelTrilhaDeEvidencias(["Trilha de Evidências DataMesh"]):::ReadModel
    DomainEventRevogacaoAvaliada:::DomainEvent --> DocModeloRegistroDeAvaliacaoDeRevogacao["Registro de Avaliação de Revogação - modelo: grupo, tabela, finalidade, origem (matrix), resultado da avaliação, atividade de tratamento afetada<br>"]
    DocModeloRegistroDeAvaliacaoDeRevogacao@{ shape: doc}
    DocModeloRegistroDeAvaliacaoDeRevogacao:::ReadModel
    DomainEventRevogacaoAvaliada:::DomainEvent -- vínculo localizado --> CommandRemoverTabelaDaAtividadeDeTratamento["Remover Tabela da Atividade de Tratamento"]:::Command
    CommandRemoverTabelaDaAtividadeDeTratamento:::Command --> AggreagateAtividadeDeTratamento["Atividade de Tratamento"]:::Aggreagate
    AggreagateAtividadeDeTratamento:::Aggreagate --> DomainEventTabelaRemovidaDaAtividadeDeTratamento(["Tabela Removida da Atividade de Tratamento"]):::DomainEvent
    DomainEventTabelaRemovidaDaAtividadeDeTratamento:::DomainEvent --> PolicySincronizarAtividadeNoRoPA>"Sincronizar Atividade no RoPA"]:::Policy
    PolicySincronizarAtividadeNoRoPA:::Policy --> CommandAtualizarEscopoDaAtividadeDeTratamentoNoOneTrust["Atualizar Escopo da Atividade de Tratamento no OneTrust"]:::Command
    CommandAtualizarEscopoDaAtividadeDeTratamentoNoOneTrust:::Command -. via .-> ExternalSystemRopa(("RoPA (OneTrust)")):::ExternalSystem
    CommandAtualizarEscopoDaAtividadeDeTratamentoNoOneTrust:::Command --> DomainEventEscopoDaAtividadeRefletidoNoRoPA(["Escopo da Atividade Refletido no RoPA"]):::DomainEvent
    DomainEventEscopoDaAtividadeRefletidoNoRoPA:::DomainEvent --> ReadModelAtividadeDeTratamentoOneTrustRoPA(["Atividade de Tratamento OneTrust RoPA"]):::ReadModel
    DomainEventTabelaRemovidaDaAtividadeDeTratamento:::DomainEvent --> PolicyAvaliarContinuidadeDaAtividadeDeTratamento>"Avaliar Continuidade da Atividade de Tratamento"]:::Policy
    PolicyAvaliarContinuidadeDaAtividadeDeTratamento:::Policy -. consulta .-> ReadModelIndiceDeAtividadesDeTratamento
    PolicyAvaliarContinuidadeDaAtividadeDeTratamento:::Policy -- último vínculo removido --> CommandEncaminharAtividadeParaRevisaoDePEDNoOneTrust["Encaminhar Atividade para Revisão de PED no OneTrust"]:::Command
    CommandEncaminharAtividadeParaRevisaoDePEDNoOneTrust:::Command -. via .-> ExternalSystemRopa
    CommandEncaminharAtividadeParaRevisaoDePEDNoOneTrust:::Command --> DomainEventAtividadeDeTratamentoEncaminhadaParaRevisao(["Atividade de Tratamento Encaminhada para Revisão"]):::DomainEvent
    DomainEventAtividadeDeTratamentoEncaminhadaParaRevisao:::DomainEvent --> ReadModelFilaDeRevisaoDePEDOneTrust(["Fila de Revisão de PED OneTrust"]):::ReadModel
    ReadModelFilaDeRevisaoDePEDOneTrust:::ReadModel --> ActorAnalistaDePrivacidadePED(("Analista de Privacidade PED")):::Actor
    ReadModelTrilhaDeEvidencias:::ReadModel --> ActorEncarregadoDPO(("Encarregado DPO")):::Actor

    classDef Policy fill:#E1BEE7
    classDef Aggreagate fill:#FFD600
    classDef Command fill:#BBDEFB
    classDef DomainEvent fill:#FF6D00
    classDef ExternalSystem fill:#00C853
    classDef ReadModel fill:#C8E6C9
    classDef Actor fill:#FFF9C4
```
