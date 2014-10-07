(function() {
  var BICC,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BICC = (function() {
    function BICC(element, typeObj) {
      this.element = element;
      this.showDetailData = __bind(this.showDetailData, this);
      this.featureStyle = __bind(this.featureStyle, this);
      this.type = typeObj.value;
      this.typeText = typeObj.text;
      this.mapLayer = new L.TileLayer("http://{s}.tiles.mapbox.com/v3/codeformuenster.ino9j865/{z}/{x}/{y}.png");
      this.map = new L.Map(this.element, {
        center: [38.1, 5.6],
        zoom: 2
      }).addLayer(this.mapLayer);
      this.colors = ['rgb(255,255,178)', 'rgb(254,204,92)', 'rgb(253,141,60)', 'rgb(227,26,28)'];
      this.conduct_legend = ['not considered', 'uncritical', 'possibly critical', 'critical'];
      this.dsv = d3.dsv(";", "text/plain");
      this.worldLayer = L.geoJson(null, {
        style: this.featureStyle,
        onEachFeature: (function(_this) {
          return function(feature, layer) {
            var popupText;
            popupText = "Country: " + feature.properties.name + " <br/>" + _this.typeText + ": " + _this.conduct_legend[_this.typeValue(feature)];
            layer.bindPopup(popupText);
            return layer.on({
              mouseover: _this.showDetailData
            });
          };
        })(this)
      });
      this.addWorldLayerData();
    }

    BICC.prototype.featureStyle = function(feature) {
      return {
        fillColor: this.countryColorForFeature(feature),
        weight: 0
      };
    };

    BICC.prototype.typeValue = function(feature) {
      var data;
      data = this.countryData(feature);
      if (data) {
        return data[this.type];
      } else {
        return "";
      }
    };

    BICC.prototype.countryData = function(feature) {
      return _.findWhere(this.data, {
        country_e: feature.properties.name
      });
    };

    BICC.prototype.countryColorForFeature = function(feature) {
      var value;
      value = this.typeValue(feature);
      if (value) {
        return this.colors[parseInt(value)];
      } else {
        return 'rgb(255,255,255)';
      }
    };

    BICC.prototype.setType = function(type) {
      if (type == null) {
        type = {};
      }
      this.type = type.value;
      this.typeText = type.text;
      this.map.removeLayer(this.dataLayer);
      this.dataLayer.clearLayers();
      return this.addDataLayer();
    };

    BICC.prototype.addWorldLayerData = function(url) {
      return this.dsv("../data/bicc_armsexports_2013.csv", (function(_this) {
        return function(data) {
          _this.data = data;
          return _this.addDataLayer();
        };
      })(this));
    };

    BICC.prototype.addDataLayer = function() {
      this.dataLayer = omnivore.topojson('../world-topo.json', null, this.worldLayer);
      return this.dataLayer.addTo(this.map);
    };

    BICC.prototype.showDetailData = function(event) {
      var data, detail_html, feature;
      feature = event.target.feature;
      data = this.countryData(feature);
      detail_html = "<h2>" + feature.properties.name + "</h2><p>" + data.sum_german_armsexports;
      $('#info').html(detail_html);
      return this.dsv("../data/ruex_2000_2013.csv", function(data) {
        var exports;
        return exports = _.where(data, {
          country_e: feature.properties.name
        });
      });
    };

    return BICC;

  })();

  $(function() {
    var map;
    map = new BICC("map", {
      value: "1",
      text: "Indicator 1"
    });
    return $('#filter #type-filter .indicator').click(function(e) {
      e.preventDefault();
      $('#filter #type-filter .indicator.active').removeClass('active');
      $(this).addClass('active');
      return map.setType({
        value: $(this).data('type'),
        text: $(this).text()
      });
    });
  });

}).call(this);
