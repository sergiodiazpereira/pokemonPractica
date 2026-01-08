
/**
 * Ejercicio 1: Buscar y mostrar información del Pokemon con FETCH
 */
/**
 * Función para buscar pokemon ejercicio 1 y 2.
 * 
*/

async function buscarPokemon() {
    let inputPokemon = document.getElementById("pokemon-input");
    let nombreBusqueda = inputPokemon.value.toLowerCase().trim();
    let contenedorRespuesta = document.getElementById("pokemon-data");

    if (!nombreBusqueda) return alert("Por favor, escribe un nombre.");

    try {
        // 1. Datos básicos del Pokémon buscado
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombreBusqueda}`);
        if (!res.ok) throw new Error("Pokémon no encontrado");
        const datos = await res.json();

        // 2. Obtener especie y cadena de evolución
        const resEspecie = await fetch(datos.species.url);
        const datosEspecie = await resEspecie.json();
        const resEvolucion = await fetch(datosEspecie.evolution_chain.url);
        const datosEvolucion = await resEvolucion.json();

        // MOSTRAR EL POKÉMON BUSCADO PRIMERO
        contenedorRespuesta.innerHTML = `
            <br><br><br><h2>${datos.name.toUpperCase()} (#${datos.id})</h2>
            <h3>Forma Actual</h3>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <img src="${datos.sprites.front_default}" alt="${datos.name}">
                <img src="${datos.sprites.front_shiny}" alt="${datos.name} shiny">
            </div>
            <p><strong>Tipo:</strong> ${datos.types.map(t => t.type.name).join(', ')}</p><br><br>
            <hr><br><br>
            <h2>Línea evolutiva posterior</h2>
        `;

        // 3. ENCONTRAR EL NODO ACTUAL (Donde está el Pokémon buscado)
        let nodoEncontrado = null;
        let pilaBusqueda = [datosEvolucion.chain];

        while (pilaBusqueda.length > 0) {
            let nodo = pilaBusqueda.pop();
            if (nodo.species.name === nombreBusqueda) {
                nodoEncontrado = nodo;
                break;
            }
            pilaBusqueda.push(...nodo.evolves_to);
        }

        // 4. MOSTRAR TODAS LAS EVOLUCIONES POSTERIORES (Sin recursividad)
        if (!nodoEncontrado || nodoEncontrado.evolves_to.length === 0) {
            contenedorRespuesta.innerHTML += `<p>Este Pokémon no tiene evoluciones posteriores.</p>`;
        } else {
            // Usamos una pila para procesar todas las ramas y niveles (Eevee, Poliwhirl, etc.)
            let pilaEvoluciones = [...nodoEncontrado.evolves_to];

            while (pilaEvoluciones.length > 0) {
                let etapa = pilaEvoluciones.shift(); // Tomamos la primera evolución de la lista
                
                const resPoke = await fetch(`https://pokeapi.co/api/v2/pokemon/${etapa.species.name}`);
                const poke = await resPoke.json();

                let detallesEv = "";
                if (etapa.evolution_details.length > 0) {
                    const det = etapa.evolution_details[0];
                    
                    const nivel = det.min_level ? `Nivel ${det.min_level}` : "";
                    const item = det.item ? `${det.item.name.replace("-", " ")}` : "";
                    const felicidad = det.min_happiness ? `${det.min_happiness} de felicidad` : "";
                    const afecto = det.min_affection ? `${det.min_affection} de afecto` : "";
                    const hora = det.time_of_day ? `de ${det.time_of_day === "day" ? "día" : "noche"}` : "";
                    const movimientoTipo = det.known_move_type ? `movimiento tipo ${det.known_move_type.name}` : "";
                    const lugar = det.location ? `En ${det.location.name.replace("-", " ")}` : "";
                    
                    const disparador = (det.trigger.name === "level-up" || det.trigger.name === "use-item") 
                        ? "" 
                        : det.trigger.name.replace("-", " ");
                    
                    const requisitosTexto = [nivel, item, felicidad, afecto, hora, movimientoTipo, lugar, disparador]
                        .filter(texto => texto !== "")
                        .join(' + ');

                    detallesEv = `<p style="color: #e67e22;"><strong>Requisito de evolución:</strong> ${requisitosTexto}</p>`;
                }

                contenedorRespuesta.innerHTML += `
                    <div class="evolucion-card" style="border-bottom: 2px solid #ccc; margin-bottom: 20px;">
                        <h3>${poke.name.toUpperCase()} (#${poke.id})</h3>
                        ${detallesEv}
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <img src="${poke.sprites.front_default}" alt="${poke.name}">
                            <img src="${poke.sprites.front_shiny}" alt="${poke.name} shiny">
                        </div>
                        <p>Tipo: ${poke.types.map(t => t.type.name).join(', ')}</p>
                    </div>
                `;

                // Si esta evolución tiene más evoluciones (ej: de Pikachu a Raichu), las añadimos a la pila
                if (etapa.evolves_to.length > 0) {
                    pilaEvoluciones.push(...etapa.evolves_to);
                }
            }
        }

        document.getElementById("result-section").classList.remove("hidden");

    } catch (error) {
        console.error("Error:", error);
        contenedorRespuesta.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}
document.getElementById('search-btn').addEventListener('click',buscarPokemon);


/**
 * Ejercicio 3: buscar pokemon con JQuery AJAX.
 */

function buscarPokemonJQueryAJAX(){
    /**
     * Tu código aquí.
     */
}

/**
 * Haciendo uso de JQuery, descomentar para usar la función buscarPokemonJQueryAJAX
*/
/**
$(document).ready(function(){
    $('#search-btn').on('click', buscarPokemonJQueryAJAX);
}); 
*/