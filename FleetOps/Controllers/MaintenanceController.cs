using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class MaintenanceController : Controller
{
    public IActionResult Index() => View();
}
