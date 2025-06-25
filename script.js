document.addEventListener('DOMContentLoaded', () => {
    // ---- CONFIGURACIÓN INICIAL ----
    const { jsPDF } = window.jspdf;
    const mainContainer = document.querySelector('.container');

    // ---- FUNCIONES AUXILIARES ----
    
    const formatCurrency = (value) => {
        if (isNaN(value)) value = 0;
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        return formatted.replace('$', '$ ');
    };

    const unformatCurrency = (value) => {
        if (typeof value !== 'string') return value || 0;
        return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
    };

    const applyColor = (element, value) => {
        if (!element) return;
        element.classList.remove('positive', 'negative');
        if (value > 0) element.classList.add('positive');
        if (value < 0) element.classList.add('negative');
    };
    
    const addFormattingEvents = (input) => {
        input.addEventListener('blur', (e) => {
            const value = unformatCurrency(e.target.value);
            e.target.value = formatCurrency(value);
            calcularResultados();
        });
        
        input.addEventListener('focus', (e) => {
            const value = unformatCurrency(e.target.value);
            e.target.value = value === 0 ? '' : value;
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const allFields = Array.from(document.querySelectorAll('.input-field'));
                const currentIndex = allFields.indexOf(e.target);
                const nextField = allFields[currentIndex + 1];
                if (nextField) {
                    nextField.focus();
                }
            }
        });
    };

    // ---- LÓGICA DE CÁLCULO PRINCIPAL ----
    function calcularResultados() {
        try {
            const sumarCategoria = (category) => {
                let total = 0;
                document.querySelectorAll(`.input-field[data-category="${category}"]`).forEach(input => {
                    total += unformatCurrency(input.value);
                });
                return total;
            };

            const totalIngresos = sumarCategoria('ingresos');
            const totalCostoServicio = sumarCategoria('costo-servicio');
            const totalGastosOperativos = sumarCategoria('gastos-op');
            
            const impuestosFijosElement = document.getElementById('impuestosFijos');
            const impuestosFijos = impuestosFijosElement ? unformatCurrency(impuestosFijosElement.value) : 0;
            
            const utilidadBruta = totalIngresos - totalCostoServicio;
            const utilidadOperativa = utilidadBruta - totalGastosOperativos;
            const utilidadAntesImpuestos = utilidadOperativa;
            const utilidadNeta = utilidadAntesImpuestos - impuestosFijos;

            const sueldoDirector = utilidadNeta > 0 ? utilidadNeta * 0.12 : 0;
            const sueldoPresidente = utilidadNeta > 0 ? utilidadNeta * 0.15 : 0;
            const totalSueldosDirectivos = sueldoDirector + sueldoPresidente;
            const utilidadNetaDespuesDirectivos = utilidadNeta - totalSueldosDirectivos;
            
            const participacionSocio1 = utilidadNetaDespuesDirectivos > 0 ? utilidadNetaDespuesDirectivos * 0.10 : 0;
            const participacionSocio2 = utilidadNetaDespuesDirectivos > 0 ? utilidadNetaDespuesDirectivos * 0.10 : 0;
            const utilidadAntesReservaLegal = utilidadNetaDespuesDirectivos - participacionSocio1 - participacionSocio2;
            const reservaLegal = utilidadAntesReservaLegal > 0 ? utilidadAntesReservaLegal * 0.10 : 0;
            const utilidadRetenida = utilidadAntesReservaLegal - reservaLegal;


            const margenBruto = totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0;
            const margenOperativo = totalIngresos > 0 ? (utilidadOperativa / totalIngresos) * 100 : 0;
            const margenNeto = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;

            const safeSetText = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };
            const safeSetFormattedCurrency = (id, value, isCost = false) => {
                const element = document.getElementById(id);
                if (element) element.textContent = isCost ? `(${formatCurrency(value)})` : formatCurrency(value);
            };

            safeSetFormattedCurrency('totalIngresos', totalIngresos);
            safeSetFormattedCurrency('totalCostoServicio', totalCostoServicio, true);
            safeSetFormattedCurrency('totalGastosOperativos', totalGastosOperativos, true);
            safeSetFormattedCurrency('utilidadBruta', utilidadBruta);
            safeSetFormattedCurrency('utilidadOperativa', utilidadOperativa);
            safeSetFormattedCurrency('utilidadAntesImpuestos', utilidadAntesImpuestos);
            safeSetFormattedCurrency('utilidadNeta', utilidadNeta);
            
            safeSetFormattedCurrency('sueldoDirector', sueldoDirector, true);
            safeSetFormattedCurrency('sueldoPresidente', sueldoPresidente, true);
            safeSetFormattedCurrency('totalSueldosDirectivos', totalSueldosDirectivos, true);
            safeSetFormattedCurrency('utilidadNetaDespuesDirectivos', utilidadNetaDespuesDirectivos);

            safeSetFormattedCurrency('participacionSocio1', participacionSocio1, true);
            safeSetFormattedCurrency('participacionSocio2', participacionSocio2, true);
            safeSetFormattedCurrency('reservaLegal', reservaLegal, true);

            safeSetText('margenBruto', `${margenBruto.toFixed(2)}%`);
            safeSetText('margenOperativo', `${margenOperativo.toFixed(2)}%`);
            safeSetText('margenNeto', `${margenNeto.toFixed(2)}%`);
            
            // Se actualiza la utilidad neta para la sección de distribución
            const utilidadParaDistribucionElement = document.getElementById('distribucionUtilidadNeta');
            if (utilidadParaDistribucionElement) { // Verificación añadida
                 utilidadParaDistribucionElement.textContent = formatCurrency(utilidadNetaDespuesDirectivos);
            }
            safeSetFormattedCurrency('utilidadRetenida', utilidadRetenida);

            applyColor(document.getElementById('utilidadBruta'), utilidadBruta);
            applyColor(document.getElementById('utilidadOperativa'), utilidadOperativa);
            applyColor(document.getElementById('utilidadNeta'), utilidadNeta);
            applyColor(document.getElementById('utilidadNetaDespuesDirectivos'), utilidadNetaDespuesDirectivos);
            applyColor(document.getElementById('utilidadRetenida'), utilidadRetenida);
            applyColor(document.getElementById('margenBruto'), margenBruto);
            applyColor(document.getElementById('margenOperativo'), margenOperativo);
            applyColor(document.getElementById('margenNeto'), margenNeto);
            applyColor(document.getElementById('participacionSocio1'), -participacionSocio1); // Negativo para color
            applyColor(document.getElementById('participacionSocio2'), -participacionSocio2);
            applyColor(document.getElementById('reservaLegal'), -reservaLegal);


        } catch (error) {
            console.error("Error durante los cálculos:", error);
        }
    }

    // ---- MANEJO DE EVENTOS DINÁMICOS ----
    
    const setupDateSelectors = () => {
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        yearSelect.innerHTML = '';
        for (let i = currentYear + 5; i >= currentYear - 5; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }

        monthSelect.value = currentMonth;
        yearSelect.value = currentYear;
    };
    
    mainContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-row-btn')) {
            if (confirm('¿Estás seguro de que deseas eliminar esta fila?')) {
                e.target.closest('.line-item').remove();
                calcularResultados();
            }
        }
        if (e.target.classList.contains('add-row-btn')) {
            const category = e.target.dataset.category;
            // Los botones de agregar ahora están directamente antes de su .rows-container o .sub-section-rows
            const targetRowsContainer = e.target.closest('.add-row-container').previousElementSibling;
            
            if (!targetRowsContainer || (!targetRowsContainer.classList.contains('rows-container') && !targetRowsContainer.classList.contains('sub-section-rows'))) {
                console.error("No se pudo encontrar el contenedor de filas para agregar la fila.");
                return;
            }
            
            const newRow = document.createElement('div');
            newRow.classList.add('line-item');
            newRow.innerHTML = `
                <input type="text" class="editable-label" placeholder="Nuevo Concepto...">
                <input type="text" class="input-field" data-category="${category}" placeholder="$ 0.00">
                <span class="remove-row-btn">×</span>
            `;
            targetRowsContainer.appendChild(newRow);
            
            const newInputField = newRow.querySelector('.input-field');
            addFormattingEvents(newInputField);
            newInputField.focus();
        }
    });

    // ---- FUNCIONES DE GUARDADO Y CARGA ----

    document.getElementById('save-data-btn').addEventListener('click', () => {
        const dataToSave = {
            version: 6,
            period: {
                month: document.getElementById('month-select').value,
                year: document.getElementById('year-select').value,
            },
            sectionsData: [],
            impuestos: unformatCurrency(document.getElementById('impuestosFijos').value)
        };

        document.querySelectorAll('details.section, div.info-section[data-section-id="distribucion"]').forEach(sectionElement => {
            const sectionId = sectionElement.dataset.sectionId;
             // No guardar secciones calculadas como 'sueldosDirectivos' ya que no tienen filas editables
            if (sectionId === 'sueldosDirectivos') return;


            const mainSectionData = { id: sectionId, subSections: [] }; // Estructura para guardar
            const subSectionTitles = sectionElement.querySelectorAll('.subsection-title');

            if (subSectionTitles.length > 0) { // Para secciones con sub-títulos (como Gastos Operativos)
                subSectionTitles.forEach(titleElement => {
                    const subSectionContainer = titleElement.nextElementSibling; // El .rows-container o .sub-section-rows
                    if (subSectionContainer && (subSectionContainer.classList.contains('rows-container') || subSectionContainer.classList.contains('sub-section-rows'))) {
                        const subSection = { 
                            title: titleElement.textContent, 
                            containerId: subSectionContainer.dataset.subsectionId || subSectionContainer.id, // Guardar ID del subcontenedor
                            rows: [] 
                        };
                        subSectionContainer.querySelectorAll('.line-item').forEach(row => {
                            const labelElement = row.querySelector('label') || row.querySelector('.editable-label');
                            const valueElement = row.querySelector('.input-field');
                            if (labelElement && valueElement) { // Asegurarse que es una fila de datos
                                subSection.rows.push({
                                    label: labelElement.tagName === 'INPUT' ? labelElement.value : labelElement.textContent,
                                    value: unformatCurrency(valueElement.value),
                                    isEditable: labelElement.tagName === 'INPUT',
                                    category: valueElement.dataset.category
                                });
                            }
                        });
                        if(subSection.rows.length > 0) mainSectionData.subSections.push(subSection);
                    }
                });
            } else { // Para secciones principales sin sub-títulos explícitos
                const rowsContainer = sectionElement.querySelector('.rows-container');
                if (rowsContainer) {
                    const singleSubSection = { 
                        title: null, // No hay título de subsección
                        containerId: rowsContainer.id || sectionId, // Usar ID del contenedor principal de filas
                        rows: [] 
                    };
                     rowsContainer.querySelectorAll('.line-item').forEach(row => {
                        const labelElement = row.querySelector('label') || row.querySelector('.editable-label');
                        const valueElement = row.querySelector('.input-field');
                        if (labelElement && valueElement && !row.querySelector('span.result')) { // Excluir filas de total
                            singleSubSection.rows.push({
                                label: labelElement.tagName === 'INPUT' ? labelElement.value : labelElement.textContent,
                                value: unformatCurrency(valueElement.value),
                                isEditable: labelElement.tagName === 'INPUT',
                                category: valueElement.dataset.category
                            });
                        }
                    });
                    if(singleSubSection.rows.length > 0) mainSectionData.subSections.push(singleSubSection);
                }
            }
            // Solo agregar la sección si tiene subsecciones con filas
            if(mainSectionData.subSections.some(ss => ss.rows.length > 0)) {
                dataToSave.sectionsData.push(mainSectionData);
            }
        });

        const dataStr = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const monthText = document.getElementById('month-select').options[document.getElementById('month-select').selectedIndex].text;
        const year = document.getElementById('year-select').value;
        link.download = `Reporte-BCC-${monthText}-${year}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    });

    const fileLoader = document.getElementById('file-loader');
    document.getElementById('load-data-btn').addEventListener('click', () => {
        fileLoader.click();
    });

    fileLoader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // Limpiar solo los contenedores de filas que se van a rellenar
                document.querySelectorAll('.rows-container, .sub-section-rows').forEach(c => c.innerHTML = '');

                const monthSelect = document.getElementById('month-select');
                const yearSelect = document.getElementById('year-select');
                const impuestosFijosInput = document.getElementById('impuestosFijos');

                if (monthSelect) monthSelect.value = data.period.month;
                if (yearSelect) yearSelect.value = data.period.year;
                if (impuestosFijosInput) impuestosFijosInput.value = formatCurrency(data.impuestos || 0);

                data.sectionsData.forEach(sectionSavedData => {
                    const sectionElement = document.querySelector(`[data-section-id="${sectionSavedData.id}"]`);
                     // No intentar cargar filas para 'sueldosDirectivos' ya que se calculan
                    if (sectionElement && sectionSavedData.id !== 'sueldosDirectivos') { 
                        sectionSavedData.subSections.forEach(subSectionSavedData => {
                            let targetContainer;
                            if(subSectionSavedData.title){ // Si es una subsección con título
                                const subSectionTitles = sectionElement.querySelectorAll('.subsection-title');
                                const matchingTitleElement = Array.from(subSectionTitles).find(titleEl => titleEl.textContent === subSectionSavedData.title);
                                if (matchingTitleElement) {
                                    targetContainer = matchingTitleElement.nextElementSibling;
                                }
                            } else { // Si es una sección principal sin sub-títulos (ej. Ingresos)
                                targetContainer = sectionElement.querySelector('.rows-container');
                            }
                            
                            if (targetContainer && (targetContainer.classList.contains('rows-container') || targetContainer.classList.contains('sub-section-rows'))) {
                                targetContainer.innerHTML = ''; // Limpiar antes de rellenar
                                subSectionSavedData.rows.forEach(rowData => {
                                    const newRow = document.createElement('div');
                                    newRow.classList.add('line-item');
                                    const labelHTML = rowData.isEditable
                                        ? `<input type="text" class="editable-label" value="${rowData.label}">`
                                        : `<label>${rowData.label}</label>`;
                                    newRow.innerHTML = `
                                        ${labelHTML}
                                        <input type="text" class="input-field" data-category="${rowData.category}" value="${formatCurrency(rowData.value)}">
                                        <span class="remove-row-btn">×</span>
                                    `;
                                    targetContainer.appendChild(newRow);
                                    addFormattingEvents(newRow.querySelector('.input-field'));
                                });
                            } else {
                                console.warn(`Contenedor para subsección "${subSectionSavedData.title || 'principal'}" en sección "${sectionSavedData.id}" no encontrado o no es válido.`);
                            }
                        });
                    } else if (sectionSavedData.id !== 'sueldosDirectivos') {
                         console.warn(`Sección principal con id "${sectionSavedData.id}" no encontrada.`);
                    }
                });

                calcularResultados(); // Muy importante llamar esto después de cargar todo
                alert('Datos cargados correctamente.');
            } catch (error) {
                alert('Error al cargar el archivo. Asegúrate de que es un archivo de reporte válido.');
                console.error("Error detallado al cargar:", error);
            } finally {
                event.target.value = null;
            }
        };
        reader.readAsText(file);
    });

    // ---- EVENTOS INICIALES ----
    setupDateSelectors();
    document.querySelectorAll('.input-field').forEach(addFormattingEvents);
    mainContainer.addEventListener('input', calcularResultados);
    
    document.getElementById('export-pdf-btn').addEventListener('click', () => { 
        const reportContainer = document.getElementById('reporte-container');
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        const selectedMonthText = monthSelect.options[monthSelect.selectedIndex].text;
        const selectedYear = yearSelect.value;
        const reportTitle = `${selectedMonthText} ${selectedYear}`;
        const fileName = `Estado de Resultados - ${reportTitle}.pdf`;

        document.body.classList.add('exporting');
        document.querySelectorAll('details').forEach(detail => detail.open = true);

        html2canvas(reportContainer, {
            scale: 2,
            useCORS: true,
            windowHeight: reportContainer.scrollHeight,
            windowWidth: reportContainer.scrollWidth
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgHeight = pdfWidth / ratio;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
            while (heightLeft > 0) {
              position -= pdfHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pdfHeight;
            }
            pdf.save(fileName);
            document.body.classList.remove('exporting');
        });
    });
    
    document.querySelectorAll('.input-field').forEach(input => {
         const value = unformatCurrency(input.placeholder);
         input.value = formatCurrency(value);
    });
    calcularResultados();
});