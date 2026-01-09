let coleccionPokemon = [];

function buscarPokemon() {
    let inputPokemon = document.getElementById("pokemon-input");
    let nombreBusqueda = inputPokemon.value.toLowerCase().trim();
    let contenedorRespuesta = document.getElementById("pokemon-data");

    if (!nombreBusqueda) return alert("Por favor, escribe un nombre.");

    // 1. SOLICITUD DATOS BÁSICOS
    fetch(`https://pokeapi.co/api/v2/pokemon/${nombreBusqueda}`)
        .then(res => {
            if (!res.ok) throw new Error("Pokémon no encontrado");
            return res.json();
        })
        .then(datos => {
            // RENDERIZAR POKÉMON BUSCADO
            contenedorRespuesta.innerHTML = `
                <br><br><br><h2>${datos.name.toUpperCase()} (#${datos.id})</h2>
                <h3>Forma Actual</h3>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <img src="${datos.sprites.front_default}" alt="${datos.name}">
                    <img src="${datos.sprites.front_shiny}" alt="${datos.name} shiny">
                </div>
                <p><strong>Tipo:</strong> ${datos.types.map(t => t.type.name).join(', ')}</p>
            `;

            // 2. SOLICITUD ESPECIE
            return fetch(datos.species.url);
        })
        .then(resEspecie => resEspecie.json())
        .then(datosEspecie => {
            // --- SECCIÓN DE VERSIONES REGIONALES ---
            const listaVariedades = datosEspecie.varieties.filter(v => v.pokemon.name !== nombreBusqueda);
            
            if (listaVariedades.length > 0) {
                contenedorRespuesta.innerHTML += `<div id="regionales-container" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;"></div><br><br>`;
                
                listaVariedades.forEach(v => {
                    fetch(v.pokemon.url)
                        .then(resV => resV.json())
                        .then(datosV => {
                            let region = "Especial";
                            if (datosV.name.includes("-alola")) region = "Alola";
                            else if (datosV.name.includes("-galar")) region = "Galar";
                            else if (datosV.name.includes("-hisui")) region = "Hisui";
                            else if (datosV.name.includes("-paldea")) region = "Paldea";
                            else if (datosV.name.includes("-mega")) region = "Mega-evolución";

                            document.getElementById("regionales-container").innerHTML += `
                                <div style="padding: 10px; border-radius: 8px; background: none; text-align: center; min-width: 160px;">
                                    <h3>Forma ${region}</h3>
                                    <strong>${datosV.name.replace("-", " ").toUpperCase()}</strong><br>
                                    <img src="${datosV.sprites.front_default}">
                                    <img src="${datosV.sprites.front_shiny}"><br>
                                    <small>Tipo: ${datosV.types.map(t => t.type.name).join(', ')}</small><br><br><br>
                                </div>`;
                        });
                });
            }

            contenedorRespuesta.innerHTML += `<hr><br><br><h2>Línea evolutiva posterior</h2>`;

            // 3. SOLICITUD CADENA EVOLUTIVA
            return fetch(datosEspecie.evolution_chain.url)
                .then(resEvo => resEvo.json())
                .then(datosEvolucion => {
                    let nodoEncontrado = null;
                    let pilaBusqueda = [datosEvolucion.chain];

                    while (pilaBusqueda.length > 0) {
                        let nodo = pilaBusqueda.pop();
                        if (nodo.species.name === datosEspecie.name) {
                            nodoEncontrado = nodo;
                            break;
                        }
                        pilaBusqueda.push(...nodo.evolves_to);
                    }

                    if (!nodoEncontrado || nodoEncontrado.evolves_to.length === 0) {
                        contenedorRespuesta.innerHTML += `<p>Este Pokémon no tiene evoluciones posteriores.</p>`;
                    } else {
                        let pilaEvoluciones = [...nodoEncontrado.evolves_to];

                        while (pilaEvoluciones.length > 0) {
                            let etapa = pilaEvoluciones.shift();
                            
                            fetch(`https://pokeapi.co/api/v2/pokemon/${etapa.species.name}`)
                                .then(resP => resP.json())
                                .then(poke => {
                                    let det = etapa.evolution_details[0] || {};
                                    let requisitos = [
                                        det.min_level ? `Nivel ${det.min_level}` : "",
                                        det.item ? det.item.name.replace("-", " ") : "",
                                        det.min_happiness ? `${det.min_happiness} de felicidad` : "",
                                        det.time_of_day ? `de ${det.time_of_day === "day" ? "día" : "noche"}` : "",
                                        det.location ? `En ${det.location.name.replace("-", " ")}` : ""
                                    ].filter(t => t !== "").join(' + ');

                                    contenedorRespuesta.innerHTML += `
                                        <div class="evolucion-card" style="border-bottom: 2px solid #ccc; margin-bottom: 20px;">
                                            <h3>${poke.name.toUpperCase()} (#${poke.id})</h3>
                                            ${requisitos ? `<p style="color: #e67e22;"><strong>Requisito:</strong> ${requisitos}</p>` : ""}
                                            <div style="display: flex; gap: 10px; justify-content: center;">
                                                <img src="${poke.sprites.front_default}">
                                                <img src="${poke.sprites.front_shiny}">
                                            </div>
                                            <p>Tipo: ${poke.types.map(t => t.type.name).join(', ')}</p>
                                        </div>
                                    `;
                                });
                            
                            if (etapa.evolves_to.length > 0) {
                                pilaEvoluciones.push(...etapa.evolves_to);
                            }
                        }
                    }
                });
        })
        .then(() => {
            document.getElementById("result-section").classList.remove("hidden");
        })
        .catch(error => {
            console.error("Error:", error);
            contenedorRespuesta.innerHTML = `
                <div style="color: #cf0015ff; padding: 20px; border-radius: 8px; text-align: center;">
                    <h2 style="color: #cf0015ff;">Error</h2>
                    <p>${error.message}. Por favor, verifica que el nombre esté bien escrito.</p>
                </div>
            `;
            document.getElementById("result-section").classList.remove("hidden");
        });
}



function buscarPokemonJQueryAJAX() {
    console.log("dfs");
    let nombreBusqueda = $("#pokemon-input").val().toLowerCase().trim();
    let $contenedor = $("#pokemon-data"); 

    if (!nombreBusqueda) return alert("Por favor, escribe un nombre.");

    // 1. PRIMERA PETICIÓN: Datos básicos
    $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon/${nombreBusqueda}`,
        method: "GET",
        success: function(datos) {
            // --- CAMBIO INTEGRADO: Datos para la colección ---
            const pokemonParaCapturar = {
                id: datos.id,
                nombre: datos.name,
                sprite: datos.sprites.front_default
            };

            // Limpiar y mostrar datos básicos con jQuery
            // Se añade el botón con ID #boton-anadir
            $contenedor.html(`
                <br><br><br><h2>${datos.name.toUpperCase()} (#${datos.id})</h2>
                <h3>Forma Actual</h3>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <img src="${datos.sprites.front_default}" alt="${datos.name}">
                    <img src="${datos.sprites.front_shiny}" alt="${datos.name} shiny">
                </div>
                <p><strong>Tipo:</strong> ${datos.types.map(t => t.type.name).join(', ')}</p>
                
                <button style="padding: 0.7rem 1.2rem;
                        font-size: 1rem;
                        color: #000;
                        background-color: #00f7ff;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background-color 0.3s ease;"
                id="boton-anadir">Añadir</button><br><br>
                <br><br>
            `);

            // --- CAMBIO INTEGRADO: Evento de clic para capturar ---
            $("#boton-anadir").off("click").on("click", function() {
                if (coleccionPokemon.some(p => p.id === pokemonParaCapturar.id)) {
                    alert("Este Pokémon ya está en tu colección.");
                } else {
                    coleccionPokemon.push(pokemonParaCapturar);
                    alert(`¡${pokemonParaCapturar.nombre.toUpperCase()} agregado con éxito!`);
                }
            });

            // 2. SEGUNDA PETICIÓN: Especie (para variantes y evolución)
            $.ajax({
                url: datos.species.url,
                method: "GET",
                success: function(datosEspecie) {
                    
                    // --- VARIANTES REGIONALES ---
                    const listaVariedades = datosEspecie.varieties.filter(v => v.pokemon.name !== datos.name);
                    
                    if (listaVariedades.length > 0) {
                        let $divVariantes = $('<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;"></div>');
                        $contenedor.append('<h3>Variantes Regionales / Otras Formas</h3>').append($divVariantes);

                        listaVariedades.forEach(v => {
                            $.get(v.pokemon.url, function(datosV) {
                                let region = datosV.name.includes("-alola") ? "Alola" : 
                                             datosV.name.includes("-galar") ? "Galar" : 
                                             datosV.name.includes("-hisui") ? "Hisui" : "Especial";

                                $divVariantes.append(`
                                    <div style="padding: 10px; border-radius: 8px; text-align: center; min-width: 160px;">
                                        <h3>Forma ${region}</h3>
                                        <strong>${datosV.name.replace("-", " ").toUpperCase()}</strong><br>
                                        <img src="${datosV.sprites.front_default}">
                                        <img src="${datosV.sprites.front_shiny}"><br>
                                        <small>Tipo: ${datosV.types.map(t => t.type.name).join(', ')}</small>
                                    </div>
                                `);
                            });
                        });
                    }

                    // 3. TERCERA PETICIÓN: Cadena de evolución
                    $.ajax({
                        url: datosEspecie.evolution_chain.url,
                        method: "GET",
                        success: function(datosEvo) {
                            $contenedor.append('<hr><br><br><h2>Línea evolutiva posterior</h2>');

                            let nodoEncontrado = null;
                            let pila = [datosEvo.chain];
                            while(pila.length > 0) {
                                let nodo = pila.pop();
                                if(nodo.species.name === datosEspecie.name) {
                                    nodoEncontrado = nodo;
                                    break;
                                }
                                pila.push(...nodo.evolves_to);
                            }

                            if (!nodoEncontrado || nodoEncontrado.evolves_to.length === 0) {
                                $contenedor.append('<p>Este Pokémon no tiene evoluciones posteriores.</p>');
                            } else {
                                let pilaEvo = [...nodoEncontrado.evolves_to];
                                while(pilaEvo.length > 0) {
                                    let etapa = pilaEvo.shift();
                                    
                                    $.get(`https://pokeapi.co/api/v2/pokemon/${etapa.species.name}`, function(poke) {
                                        $contenedor.append(`
                                            <div class="evolucion-card" style="border-bottom: 2px solid #ccc; margin-bottom: 20px;">
                                                <h3>${poke.name.toUpperCase()} (#${poke.id})</h3>
                                                <div style="display: flex; gap: 10px; justify-content: center;">
                                                    <img src="${poke.sprites.front_default}">
                                                    <img src="${poke.sprites.front_shiny}">
                                                </div>
                                                <p>Tipo: ${poke.types.map(t => t.type.name).join(', ')}</p>
                                            </div>
                                        `);
                                    });

                                    if(etapa.evolves_to.length > 0) pilaEvo.push(...etapa.evolves_to);
                                }
                            }
                        }
                    });
                }
            });

            $("#result-section, #collection-section").removeClass("hidden").hide().fadeIn(500);
        },
        error: function(xhr) {
            let mensaje = xhr.status === 404 ? "Pokémon no encontrado" : "Error en la API";
            $contenedor.html(`<p style="color: red; text-align: center;">Error: ${mensaje}</p>`);
            $("#result-section").removeClass("hidden");
        }
    });
}

//document.getElementById('search-btn').addEventListener('click',buscarPokemon);
document.getElementById('search-btn').addEventListener('click',buscarPokemonJQueryAJAX);


function agregarAColeccion(pokemon) {
    if (coleccionPokemon.some(p => p.id === pokemon.id)) {
        alert("Ya tienes a este Pokémon en tu colección.");
    } else {
        coleccionPokemon.push(pokemon);
        alert(`¡${pokemon.nombre.toUpperCase()} agregado con éxito!`);
    }
}

// Función para mostrar la colección en la sección especial
function mostrarColeccion() {
    let $lista = $("#collection-list");
    $lista.empty(); // Limpiar antes de rellenar

    if (coleccionPokemon.length === 0) {
        $lista.append("<p>Tu colección está vacía actualmente.</p>");
    } else {
        coleccionPokemon.forEach(p => {
            $lista.append(`
                <div style="display: inline-block; margin: 10px; text-align: center; border: 1px solid #ccc; border-radius: 10px; padding: 15px; width: 140px;">
                    <img src="${p.sprite}" width="100"><br>
                    <strong>${p.nombre.toUpperCase()}</strong><br>
                    <small>ID: #${p.id}</small>
                </div>
            `);
        });
    }
}

$(document).ready(function () {
    // Evento para el botón "Ver colección" de tu HTML
    $("#view-collection-btn").on("click", mostrarColeccion);

});
