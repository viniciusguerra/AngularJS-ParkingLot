# App de Estacionamento em AngularJS

## Configurações

A configuração do aplicativo se dá através do arquivo app/config.js.
Através da função 'Config(PlateManagerServiceProvider, MetaServiceProvider)' é possível configurar informações do sistema e dos serviços de estacionamento.

### 'MetaServiceProvider'

Configura meta informação da aplicação, como nome da empresa.

### 'PlateManagerServiceProvider'

O serviço de serviços de estacionamento é *desacoplado* e *dinâmico*, permitindo o registro de diversos tipos de serviço. Para isso:

Deve-se criar um objeto no formato:

```javascript
var service = {
	type: '',			//guarda o nome desse serviço para uso em operações do sistema
	description: '',	//usado para exibição de informações sobre o serviço na página de listagem
	capacity: 0,		//capacidade de clientes para esse serviço
	price: 0,			//custo do serviço usado no calculo, definido posteriormente
	plates: [] 			//usado para o registro das placas sob esse serviço
	}
```

Em seguida, deve-se definir a função de cálculo de preço no seguinte formato:

```javascript
var calculoDeCusto = {
	'type' : function(plate, service){
		//valor devido
		var due;

		//lógica para calculo do valor a partir de service.price...

		//atualização do valor devido
		plate.due = due;
	} 
}
```

A função que calcula o custo da placa será chamada nas seguintes situações:

1. Para todas as placas no serviço sendo exibido na página de listagem
2. Para a placa na página de detalhe quando ela é exibida e quando um novo evento é inserido

Depois de feitas as configurações, os serviços devem ser adicionados no array de serviços de estacionamento `PlateManagerServiceProvider.defaults.parkingServices`, as funções de cálculo de preço devem ser adicionadas no array de funções de cálculo `PlateManagerServiceProvider.defaults.dueCalculators` e o nome da empresa deve ser inserido na propriedade respectiva `MetaServiceProvider.defaults.companyName`		

## Instruções de Uso

O aplicativo pode ser utilizado através desse [link](https://viniciusguerra.github.io/AngularJS-ParkingLot/index.html).
Abaixo, serão explicadas suas funções principais. 

### Listagem

A listagem de placas é feita a partir [dessa página](https://viniciusguerra.github.io/AngularJS-ParkingLot/index.html#/browse), acessível clicando no nome da empresa no header ou no botão Listar no menu superior.

As seguintes abas são exibidas, respectivamente:

1. Todas as placas de todos os serviços
2. Abas geradas dinâmicamente para os serviços configurados
3. Aba de arquivo para as placas removidas

Através da barra de pesquisa no canto superior direito, é possível buscar placas pelo número.

Clicar no número de uma placa leva à sua página de detalhes.

### Detalhes

A página de detalhes exibe informações sobre a placa e uma tabela com os seus eventos de entrada e saída. Para inserir um evento, clique no botão Adicionar Evento no canto inferior esquerdo.

O único campo obrigatório é o de entrada. Ao registrar o evento:

* Se o campo de saída for preenchido o evento será inserido na tabela e usado para cálculo do custo devido.
  * O serviço rotativo conta as horas de uso entre entrada e saída de cada evento.
  * O serviço mensal cobra pelos meses em que o serviço foi utilizado. Intervalos entre meses sem uso não são contados. Eventos com intervalos de meses entre a entrada e saída são contados.
* Se o campo de saída não for preenchido, o evento será inserido na tabela e exibirá um botão no campo de horário de saída, permitindo a inserção desse valor
  * O serviço rotativo só calcula o preço após a inserção de um horário de saída
  * O serviço mensal conta com o mês de entrada mesmo sem a inserção da saída

Em uma placa ativa, o botão de Arquivar Placa fará com que ela seja arquivada, sendo exibida na página de listagem na aba de placas arquivadas. A exibição de uma placa arquivada não permite a inserção de novos eventos.

Em uma placa arquivada, o botão Excluir Placa faz com que ela seja completamente removida do sistema.

### Registro

A inserção de placas é feita a partir [dessa página](https://viniciusguerra.github.io/AngularJS-ParkingLot/index.html#/register), acessível clicando no botão Registrar no menu superior.

O número de placa deve ser *único* e seguir o padrão *AAA-0000*. Um serviço deve ser selecionado e a inserção respeitará a capacidade de clientes de cada serviço.