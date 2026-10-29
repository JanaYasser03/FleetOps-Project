using Microsoft.AspNetCore.Mvc;

namespace FleetOps.Controllers;

public class AssignmentsController : Controller
{
    public IActionResult Index() => View();
}
