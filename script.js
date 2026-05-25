
// CONFIG FIREBASE

const firebaseConfig = {
  apiKey: "AIzaSyCtps-qF0eg61hPokgcHT5XPQF2uDJPUm4",
  authDomain: "futureme-7886f.firebaseapp.com",
  projectId: "futureme-7886f",
  storageBucket: "futureme-7886f.firebasestorage.app",
  messagingSenderId: "1070764793185",
  appId: "1:1070764793185:web:adfcbbc490799e5d26b920",
  measurementId: "G-Z2BLVL72MD"
};

// iniciar firebase
firebase.initializeApp(firebaseConfig);

// auth
const auth = firebase.auth();

// firestore
const db = firebase.firestore();

// carregar cartas

async function salvarCarta(){

    let mensagem = document.getElementById("mensagem").value;

    let data = document.getElementById("data").value;

    if(mensagem === "" || data === ""){

        alert("Preencha todos os campos!");

        return;
    }

    // usuário logado
    let usuario = auth.currentUser;

    if(!usuario){

        alert("Faça login primeiro!");

        return;
    }

    // salvar no firestore
    await db.collection("cartas").add({

        mensagem: mensagem,

        data: data,

        userId: usuario.uid,

        criadoEm: new Date()

    });

    alert("Carta salva!");

    document.getElementById("mensagem").value = "";

    document.getElementById("data").value = "";

    carregarCartasFirestore();
}

function mostrarCarta(carta){

    let novaCarta = document.createElement("div");

    novaCarta.classList.add("carta");

    novaCarta.setAttribute("data-id", carta.id);

    novaCarta.innerHTML = `
        <h3>${carta.data}</h3>

        <p class="texto-carta">
            ${carta.mensagem}
        </p>

        <button class="btn-editar">
            Editar
        </button>

        <button class="btn-excluir">
            Excluir
        </button>
    `;

    // BOTÃO EXCLUIR
    let btnExcluir = novaCarta.querySelector(".btn-excluir");

    btnExcluir.addEventListener("click", function(){

        novaCarta.remove();

        removerCarta(carta.id);

    });

    // BOTÃO EDITAR
    let btnEditar = novaCarta.querySelector(".btn-editar");

    btnEditar.addEventListener("click", function(){

        editarCarta(carta.id);

    });

    lista.appendChild(novaCarta);
}

// carregar cartas
async function carregarCartasFirestore(){

    lista.innerHTML = "";

    let usuario = auth.currentUser;

    if(!usuario){
        return;
    }

    let snapshot = await db
    .collection("cartas")
    .where("userId", "==", usuario.uid)
    .get();

    snapshot.forEach((doc) => {

        let carta = {

            id: doc.id,

            ...doc.data()

        };

        mostrarCarta(carta);

    });

}

// remover carta
async function removerCarta(id){

    await db.collection("cartas").doc(id).delete();

    atualizarTelaFirestore();
}

// editar carta
function editarCarta(id){

    let cartas = JSON.parse(localStorage.getItem("cartas")) || [];

    let carta = cartas.find(carta => carta.id === id);

    let novaMensagem = prompt(
        "Edite sua mensagem:",
        carta.mensagem
    );

    if(novaMensagem === null || novaMensagem === ""){
        return;
    }

    carta.mensagem = novaMensagem;

    localStorage.setItem("cartas", JSON.stringify(cartas));

    atualizarTela();
}

// atualizar tela
function atualizarTela(){

    lista.innerHTML = "";

    carregarCartas();
}

// CADASTRO
function cadastrar(){
    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;
    auth.createUserWithEmailAndPassword(email, senha)
    .then(() => {
        alert("Conta criada com sucesso!");
    })
    .catch((error) => {

    if(error.code === "auth/email-already-in-use"){

        alert("Esse email já está cadastrado!");

    }else if(error.code === "auth/weak-password"){

        alert("A senha precisa ter pelo menos 6 caracteres.");

    }else if(error.code === "auth/invalid-email"){

        alert("Digite um email válido.");

    }else{

        alert("Erro ao cadastrar.");

    }

});
}

// LOGIN
function login(){
    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;
    auth.signInWithEmailAndPassword(email, senha)
    .then(() => {
        alert("Login realizado!");
        carregarCartasFirestore();
    })

    .catch((error) => {

    if(error.code === "auth/user-not-found"){

        alert("Usuário não encontrado.");

    }else if(error.code === "auth/wrong-password"){

        alert("Senha incorreta.");

    }else if(error.code === "auth/invalid-email"){

        alert("Email inválido.");

    }else{

        alert("Erro ao fazer login.");

    }

});
}

function atualizarTelaFirestore(){

    lista.innerHTML = "";

    carregarCartasFirestore();
}


// BOTÃO DE TEMA
let botaoTema = document.getElementById("toggle-theme");

// carregar tema salvo
let temaSalvo = localStorage.getItem("tema");

if(temaSalvo === "light"){

    document.body.classList.add("light");

    botaoTema.innerHTML = "☀️";
}

// trocar tema
botaoTema.addEventListener("click", function(){

    document.body.classList.toggle("light");

    if(document.body.classList.contains("light")){

        localStorage.setItem("tema", "light");

        botaoTema.innerHTML = "☀️";

    }else{

        localStorage.setItem("tema", "dark");

        botaoTema.innerHTML = "🌙";
    }

});

console.log("JS funcionando");