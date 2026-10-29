using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class VehiclesController : Controller
{
    public IActionResult Index() => View();
}
