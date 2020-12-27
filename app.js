let programa = [];

function carregaPrograma(e) {
	let objPrograma = new FileReader();
	
	objPrograma.onload = function(oResult) {
		let final = oResult.target.result;

		final = final.split("\n"); //Remove as quebras de linha
		final = final.map(item => {
			let marcador = item.indexOf(";");
			if (marcador+1) {
				return item.split(";")[0].trim(); //Remove os comentários
			}
			return item;
		});
		final = final.filter(item => item.length); //Remove os campos vazios
		final = final.map(item => item.split(" ")); //Divide os campos
		
		programa = final;
	}
	
	objPrograma.readAsText(e.target.files[0]);
}

function executaPrograma(entrada, velocidade, onMessage, onUpdate) {
	if (programa.length && entrada) {
		let [posicao_atual, estado_atual] = [0,"0"];
		
		let loop = setInterval(() => {		
			let filtro = programa.filter(linha => linha[0] ==  estado_atual);
			let regras = filtro.filter(linha => linha[1] == entrada[posicao_atual]);

			if (!regras.length) {
				if (!(regras = filtro.filter(linha => linha[1] == "*")).length) {
					onMessage("ERR");
					clearInterval(loop);
					return;
				}
			}
			
			regras = regras[0];
			
			// Substitui um simbolo de uma determinada posição da fita
			if (regras[2] != "*") {
				entrada = entrada.substr(0, posicao_atual) + regras[2] + entrada.substr(posicao_atual+1, entrada.length);
			}
			
			// Direciona a fita
			if(regras[3] != "*") {
				if (regras[3] != "r" && regras[3] != "l") {
					onMessage("ERR");
					clearInterval(loop);
					return;
				}
				
				posicao_atual += [-1,1][Number(regras[3] == "r")];
				if (posicao_atual < 0) {
					entrada = "_" + entrada;
					posicao_atual = 0;
				}
				else if (posicao_atual > entrada.length - 1) {
					entrada = entrada + "_";
					posicao_atual = entrada.length - 1;
				}
			}
			
			// Determina o estado atual
			if(regras[4] != "*") {
				if (regras[4].indexOf("halt")+1) {
					onMessage(entrada);
					clearInterval(loop);
				}
				estado_atual = regras[4];
			}
			
			onUpdate(entrada, posicao_atual, estado_atual);
		}, velocidade);
		
		return loop;
	}
	onMessage("ERR");
}
