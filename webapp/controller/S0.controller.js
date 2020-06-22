sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("ovly.odata.controller.S0", {
		onInit: function () {
			this._validaSaveUpdate = "";
			this._oModelForm = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this._oModelForm, "modelForm");

			this._list = this.byId("list"); // sap.m.List
			this._modelo = this.getOwnerComponent().getModel("fonte"); // v2.ODataModel
		},

		onSearch: function (oEvent) {
			var oListBinding = this._list.getBinding("items");
			var sQuery = oEvent.getParameters().query;

			if (sQuery === "") {
				oListBinding.filter();
			} else {
				var oFilter = new sap.ui.model.Filter({
					path: "Name",
					operator: sap.ui.model.FilterOperator.Contains,
					value1: sQuery
				});
				oListBinding.filter(oFilter);
			}

		},

		/*		chamaAPI: function (oEvent) { // antigo onSearch

					var sPath = "/Products";
					var oParameters = {
						success: function (dados, resposta) {
							console.table(dados.results);

							for (var i = 0; i < dados.results.length; i++) {
								var oProduct = dados.results[i];

								this._list.addItem(new sap.m.StandardListItem({
									title: oProduct.ID,
									description: oProduct.Name,
									info: oProduct.Price
								}));
							}
						}.bind(this)
					};
					this._modelo.read(sPath, oParameters);

				},*/

		onSave: function (oEvent) {

			this._oModelForm.setProperty("/busy", true);

			if (this._validaSaveUpdate !== "P") {
				function onSuccess(oProdutoCriado, resposta) {
					MessageToast.show(" Produto criado com sucesso. ID " + oProdutoCriado.ID);
				}

				function onError(oError) {
					MessageBox.error("Error: " + oError.responseText);
				}

				var oParametersInsert = {
					success: onSuccess,
					error: onError
				};

			} else if (this._validaSaveUpdate === "P") {
				function onSuccessUpdate() {
					MessageToast.show(" Produto atualizado com sucesso.");
				}

				function onErrorUpdate(oError) {
					MessageBox.error("Error: " + oError.responseText);
				}

				var oParametersUpdate = {
					success: onSuccessUpdate,
					error: onErrorUpdate
				};

			}

			var oNewProducts = {
				ID: this._oModelForm.getProperty("/ID"),
				Name: this._oModelForm.getProperty("/nome"),
				Description: this._oModelForm.getProperty("/descricao")
			};

			if (this._validaSaveUpdate === "") {

				this._modelo.create("/Products", oNewProducts, oParametersInsert);
				this._oModelForm.setProperty("/busy", false);
				this._validaSaveUpdate = "";

			} else if (this._validaSaveUpdate === "P") {

				var sPath = this._modelo.createKey("Products", {
					ID: oNewProducts.ID
				});

				this._modelo.update("/" + sPath, oNewProducts, oParametersUpdate);
				this._oModelForm.setProperty("/busy", false);
				this._validaSaveUpdate = "";
			}

		},

		onItemPress: function (oItemPress) {
			this._validaSaveUpdate = "P";
			var oParameters = oItemPress.getParameters().listItem;
			var oItemContext = oParameters.getBindingContext("fonte");

			this._oModelForm.setProperty("/ID", oItemContext.getProperty("ID"));
			this._oModelForm.setProperty("/nome", oItemContext.getProperty("Name"));
			this._oModelForm.setProperty("/descricao", oItemContext.getProperty("Description"));

		},

		onDelete: function (oDeleteItem) {
			this._validaSaveUpdate = "D";

			var oParameters = oDeleteItem.getParameters().listItem;
			var oItemContext = oParameters.getBindingContext("fonte");
			var sPath = oItemContext.getPath();

			function onSuccess() {
				MessageToast.show(" Produto deletado com sucesso ");
			}

			function onError(oError) {
				MessageBox.error("Error: " + oError.responseText);
			}

			var oSettings = {
				success: onSuccess,
				error: onError
			};

			this._modelo.remove(sPath, oSettings);

		}

	});
});