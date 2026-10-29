using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class RoutesController : Controller
{
    public IActionResult Index() => View();
}
