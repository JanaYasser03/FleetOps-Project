using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class DashboardController : Controller
{
    public IActionResult Index() => View();
}
