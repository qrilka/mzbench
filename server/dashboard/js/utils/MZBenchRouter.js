import { Router } from 'director';
import MZBenchActions from '../actions/MZBenchActions';
import BenchStore from '../stores/BenchStore';
import DashboardStore from '../stores/DashboardStore';
import GlobalStore from '../stores/GlobalStore';

function _selectBenchAndTab(benchId, activeTab) {
        MZBenchActions.turnOffDashboardMode();
        MZBenchActions.selectBenchById(benchId);

        // If 'back' button is pressed then old bench could be not
        // presented in the currently loaded timeline
        if (!BenchStore.getSelected() && !isNaN(benchId)) {
            MZBenchActions.getTimeline({bench_id: parseInt(benchId)});
        }

        MZBenchActions.selectActiveTab(activeTab);
}

function _selectDashboardAndTab(dashboardId, activeTab) {
        MZBenchActions.turnOnDashboardMode();
        MZBenchActions.selectDashboardById(dashboardId);

        if (!DashboardStore.getSelected() && !isNaN(dashboardId)) {
            MZBenchActions.getDashboards({});
        }

        MZBenchActions.selectDashboardTab(activeTab);
}

const routes = {
    '/bench/:benchId/graphs/:graphGroupId/:graphId': (benchId, graphGroupId, graphId) => {
        MZBenchActions.selectBenchById(benchId);

        // If 'back' button is pressed then old bench could be not
        // presented in the currently loaded timeline
        if (!BenchStore.getSelected() && !isNaN(benchId)) {
            MZBenchActions.getTimeline({bench_id: parseInt(benchId)});
        }
        MZBenchActions.selectGraph(graphGroupId, graphId);
    },
    '/bench/:benchId/:activeTab': (benchId, activeTab) => {
        _selectBenchAndTab(benchId, activeTab);
    },
    '/bench/:benchId/logs/:kind/:err': (benchId, kind, err) => {
        _selectBenchAndTab(benchId, "logs");
        MZBenchActions.updateLogQuery("", parseInt(benchId));
        MZBenchActions.updateLogQueryErrors((err == "errors") ? 1 : 0, parseInt(benchId));
        MZBenchActions.updateLogQueryKind((kind == "system") ? 1 : 0, parseInt(benchId));
    },
    '/bench/:benchId/logs/:kind/:err/:query': (benchId, kind, err, query) => {
        _selectBenchAndTab(benchId, "logs");
        MZBenchActions.updateLogQuery(decodeURIComponent(query), parseInt(benchId));
        MZBenchActions.updateLogQueryErrors((err == "errors") ? 1 : 0, parseInt(benchId));
        MZBenchActions.updateLogQueryKind((kind == "system") ? 1 : 0, parseInt(benchId));
    },
    '/new': () => {
        MZBenchActions.newBench();
        MZBenchActions.turnOffDashboardMode();
    },
    '/dashboard/:dashboardId/:activeTab': (dashboardId, activeTab) => {
        _selectDashboardAndTab(dashboardId, activeTab);
    },
    '/dashboard/new': () => {
        MZBenchActions.newDashboard();
        MZBenchActions.turnOnDashboardMode();
    },
    '/dashboard': () => {
        MZBenchActions.turnOnDashboardMode();
    },
    '/timeline': () => {
        let opts = Object.assign({q: ""}, _MZBenchRouter.getQuery());
        MZBenchActions.applyQueryParameters(opts);
        MZBenchActions.getTimeline({});
    },
    '/': () => {
        MZBenchActions.turnOffDashboardMode();
        MZBenchActions.getTimeline({});
    }
};

class MZBenchRouter extends Router {
    stringifyQuery(obj) {
        return Object.keys(obj).sort().reduce(function(parts, key) {
            const val = obj[key];
            if (undefined !== val) {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
            }
            return parts;
        }, []).join('&');
    }

    getQuery() {
        let path = this.history === true ? this.getPath() : document.location.hash;
        return this.parseQuery(path.split('?')[1]);
    }

    parseQuery (str) {
        str = (str || "").trim();

        return str.split('&').reduce(function (ret, param) {
            const [key, val, ...rest] = param.split('=');
            ret[decodeURIComponent(key)] = decodeURIComponent(val);
            return ret;
        }, {});
    }

    buildLink(route, queryParams) {
        let queryString = this.stringifyQuery(queryParams);
        queryString = queryString ? "?" + queryString : "";
        return route + queryString;
    }

    navigate(route, queryParams) {
        let link = this.buildLink(route, queryParams);
        this.setRoute(link);
    }
}

let _MZBenchRouter =  new MZBenchRouter(routes);
_MZBenchRouter.init();

export default _MZBenchRouter;
